"use client"

import { useAtomValue } from "@effect-atom/atom-react"
import type { OrganizationId } from "@hazel/schema"
import { eq, inArray, isNull, not, useLiveQuery } from "@tanstack/react-db"
import { sectionCollapsedAtomFamily } from "~/atoms/section-collapse-atoms"
import { ChannelIcon } from "~/components/channel-icon"
import { SidebarItem, SidebarLabel, SidebarLink } from "~/components/ui/sidebar"
import { channelCollection, channelMemberCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { Strong } from "~/components/ui/text"

const MAX_DISCOVERABLE = 5

interface DiscoverableChannelsProps {
	organizationId: OrganizationId
	onBrowseAll: () => void
}

export function DiscoverableChannels({ organizationId, onBrowseAll }: DiscoverableChannelsProps) {
	const { user } = useAuth()
	const isCollapsed = useAtomValue(sectionCollapsedAtomFamily("default"))

	// Get all channels the user is already a member of
	const { data: userChannels } = useLiveQuery(
		(q) =>
			q
				.from({ m: channelMemberCollection })
				.where(({ m }) => eq(m.userId, user?.id || ""))
				.select(({ m }) => ({ channelId: m.channelId })),
		[user?.id],
	)

	// Get public channels user hasn't joined, excluding threads
	const { data: discoverableChannels } = useLiveQuery(
		(q) => {
			const userChannelIds = userChannels?.map((m) => m.channelId) || []

			let query = q
				.from({ channel: channelCollection })
				.where(({ channel }) => eq(channel.organizationId, organizationId))
				.where(({ channel }) => eq(channel.type, "public"))
				.where(({ channel }) => isNull(channel.parentChannelId))

			if (userChannelIds.length > 0) {
				query = query.where(({ channel }) => not(inArray(channel.id, userChannelIds)))
			}

			return query
				.orderBy(({ channel }) => channel.createdAt, "asc")
				.select(({ channel }) => ({ ...channel }))
		},
		[user?.id, userChannels, organizationId],
	)

	if (isCollapsed || !discoverableChannels || discoverableChannels.length === 0) {
		return null
	}

	const visibleChannels = discoverableChannels.slice(0, MAX_DISCOVERABLE)
	const hasMore = discoverableChannels.length > MAX_DISCOVERABLE

	return (
		<div className="grid grid-cols-[auto_1fr] gap-y-0.5 px-2 pb-1">
			<div className="col-span-full pl-2.5 pt-2 pb-0.5 text-muted-fg/60 text-xs">
				<Strong>Discover</Strong>
			</div>
			{visibleChannels.map((channel) => (
				<DiscoverableChannelItem key={channel.id} channel={channel} />
			))}
			{hasMore && (
				<button
					type="button"
					onClick={onBrowseAll}
					className="col-span-full w-full rounded-lg py-1 pl-2.5 text-left text-muted-fg/60 text-sm transition-colors hover:bg-sidebar-accent hover:text-fg"
				>
					Browse all channels...
				</button>
			)}
		</div>
	)
}

interface DiscoverableChannelItemProps {
	channel: {
		id: string
		name: string
		icon: string | null
	}
}

function DiscoverableChannelItem({ channel }: DiscoverableChannelItemProps) {
	const { slug } = useOrganization()

	return (
		<SidebarItem tooltip={channel.name} className="opacity-50 hover:opacity-100">
			<SidebarLink to="/$orgSlug/chat/$id" params={{ orgSlug: slug, id: channel.id }}>
				<ChannelIcon icon={channel.icon} />
				<SidebarLabel>{channel.name}</SidebarLabel>
			</SidebarLink>
		</SidebarItem>
	)
}
