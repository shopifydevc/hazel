import { HttpApiBuilder } from "@effect/platform"
import { Database, schema } from "@hazel/db"
import type { DatabaseError, TransactionClient } from "@hazel/db/src/services/database"
import { Array, Effect, Option, Schema } from "effect"
import { CreateMessageResponse, HazelApi } from "../api"
import { InternalServerError } from "../lib/errors"
import { MessageRepo } from "../repositories/message-repo"

const TransactionId = Schema.Number.pipe(Schema.brand("@Hazel/transactionId"))
const TransactionIdFromString = Schema.NumberFromString.pipe(Schema.brand("@Hazel/transactionId"))

const generateTransactionId = Effect.fn("generateTransactionId")(function* (
	tx?: <T>(fn: (client: TransactionClient) => Promise<T>) => Effect.Effect<T, DatabaseError, never>,
) {
	const db = yield* Database.Database
	const executor = tx ?? db.execute
	const result = yield* executor((client) =>
		client.execute(`SELECT pg_current_xact_id()::xid::text as txid`),
	).pipe(
		Effect.map((rows) => rows[0]?.txid as string),
		Effect.flatMap((txid) => Schema.decode(TransactionIdFromString)(txid)),
		Effect.orDie,
	)

	return result
})

export const HttpMessageLive = HttpApiBuilder.group(HazelApi, "messages", (handlers) =>
	Effect.gen(function* () {
		const db = yield* Database.Database

		return handlers.handle(
			"create",
			Effect.fn(function* ({ payload }) {
				// Verify the channel exists
				// const channel = yield* db
				// 	.select()
				// 	.from(schema.channelsTable)
				// 	.where(eq(schema.channelsTable.id, payload.channelId))
				// 	.pipe(
				// 		Effect.map((rows) => rows[0]),
				// 		Effect.flatMap((channel) =>
				// 			channel
				// 				? Effect.succeed(channel)
				// 				: Effect.fail(new ChannelNotFoundError({ channelId: payload.channelId }))
				// 		),
				// 	)

				// TODO: Verify the user has permission to post in this channel
				// This would typically check channel membership, organization membership, etc.
				// For now, we'll just create the message

				const { createdMessage, txid } = yield* db
					.transaction((tx) =>
						Effect.gen(function* () {
							const createdMessage = yield* MessageRepo.insert({
								channelId: payload.channelId,
								authorId: payload.authorId,
								content: payload.content,
								replyToMessageId: payload.replyToMessageId || null,
								threadChannelId: null,
								deletedAt: null,
							}).pipe(Effect.map((res) => res[0]!))

							const txid = yield* generateTransactionId(tx)

							return { createdMessage, txid }
						}),
					)
					.pipe(
						Effect.catchTags({
							DatabaseError: (err) =>
								new InternalServerError({ message: "Error Creating Message", cause: err }),
							ParseError: (err) =>
								new InternalServerError({
									message: "Error Parsing Response Schema",
									cause: err,
								}),
						}),
					)

				return {
					data: createdMessage,
				}
			}),
		)
	}),
)
