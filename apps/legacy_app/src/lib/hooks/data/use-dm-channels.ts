import { createQuery } from "@rocicorp/zero/solid"
import { type Accessor, createMemo } from "solid-js"
import { CACHE_AWHILE } from "~/lib/zero/query-cache-policy"
import { useZero } from "~/lib/zero/zero-context"

export const useDmChannels = (serverId: Accessor<string>) => {
	const z = useZero()

	const dmChannelQuery = createMemo(() =>
		z.query.serverChannels
			.related("users")
			.related("members")
			.limit(10)
			.where((eq) =>
				eq.and(
					eq.or(eq.cmp("channelType", "=", "direct"), eq.cmp("channelType", "=", "single")),
					eq.cmp("serverId", "=", serverId()),
				),
			),
	)

	const [recentDmChannels, status] = createQuery(dmChannelQuery, CACHE_AWHILE)

	const isLoading = createMemo(() => status().type !== "complete")

	return { channels: recentDmChannels, isLoading }
}
