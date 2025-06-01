import { createQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { CACHE_AWHILE } from "~/lib/zero/query-cache-policy"
import { useZero } from "~/lib/zero/zero-context"

export const useServerChannels = (serverId: Accessor<string>) => {
	const z = useZero()

	const serverChannelQuery = createMemo(() =>
		z.query.serverChannels
			.related("users")
			.related("members")
			.where((eq) =>
				eq.and(
					eq.or(eq.cmp("channelType", "=", "public"), eq.cmp("channelType", "=", "private")),
					eq.cmp("serverId", "=", serverId()),
				),
			)
			.whereExists("users", (eq) => eq.where("id", "=", z.userID)),
	)

	const [serverChannels, status] = createQuery(serverChannelQuery, CACHE_AWHILE)

	const isLoading = createMemo(() => status().type !== "complete")

	return { channels: serverChannels, isLoading }
}
