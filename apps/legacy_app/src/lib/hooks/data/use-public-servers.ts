import { createQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { useZero } from "~/lib/zero/zero-context"

export const usePublicServers = (serverId: Accessor<string>) => {
	const z = useZero()

	const serverChannelQuery = createMemo(() =>
		z.query.serverChannels
			.related("users")
			.where((eq) => eq.and(eq.cmp("channelType", "=", "public"), eq.cmp("serverId", "=", serverId()))),
	)

	const [serverChannels, status] = createQuery(serverChannelQuery)

	const computedChannels = createMemo(() => {
		return serverChannels().filter((channel) => {
			return !channel.users.some((user) => user.id === z.userID)
		})
	})

	const isLoading = createMemo(() => status().type !== "complete")

	return { channels: computedChannels, isLoading }
}
