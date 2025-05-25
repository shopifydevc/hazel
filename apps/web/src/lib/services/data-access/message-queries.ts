import type { ChannelId, Message, MessageId } from "@maki-chat/api-schema/schema/message.js"
import { Effect } from "effect"
import type { Accessor } from "solid-js"
import { QueryData, useEffectInfiniteQuery, useEffectMutation, useEffectQuery } from "~/lib/tanstack"
import { ApiClient } from "../common/api-client"

export namespace MessageQueries {
	type InfiniteVars = {
		channelId: ChannelId
		limit?: number
	}
	const messagesKey = QueryData.makeQueryKey<"message", InfiniteVars>("message")
	const messagesHelpers = QueryData.makeHelpers<Array<Message>, InfiniteVars>(messagesKey)

	export const createPaginatedMessagesQuery = ({
		channelId,
		limit = 20,
	}: { channelId: Accessor<ChannelId>; limit?: number }) => {
		return useEffectInfiniteQuery(() => ({
			queryKey: messagesKey({
				channelId: channelId(),
				limit,
			}),

			queryFn: ({ pageParam }) =>
				ApiClient.use(({ client }) =>
					client.message.getMessages({
						path: {
							channelId: channelId(),
						},
						urlParams: {
							limit: limit,
							cursor: pageParam as MessageId | undefined,
						},
					}),
				),

			getNextPageParam: (lastPage) => (lastPage.pagination.hasNext ? lastPage.pagination.nextCursor : undefined),
			getPreviousPageParam: (firstPage) =>
				firstPage.pagination.hasPrevious ? firstPage.pagination.previousCursor : undefined,
			initialPageParam: undefined as string | undefined,
		}))
	}

	export const createMessageMutation = (channelId: Accessor<ChannelId>) => {
		return useEffectMutation({
			mutationKey: [
				"MessageQueries.createMessage",
				{
					channelId: channelId(),
				},
			],

			mutationFn: Effect.fnUntraced(function* (message: typeof Message.jsonCreate.Type) {
				const { client } = yield* ApiClient

				const optimisticId = crypto.randomUUID()
				// yield* Ref.update(pendingOptimisticIds, (set) => set.add(optimisticId))
				// yield* Effect.addFinalizer(() =>
				// 	Ref.update(pendingOptimisticIds, (set) => {
				// 		set.delete(optimisticId)
				// 		return set
				// 	}),
				// )

				return yield* client.message.createMessage({
					payload: message,
					path: {
						channelId: channelId(),
					},
				})
			}, Effect.scoped),
		})
	}
}
