import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { Label } from "@kobalte/core/text-field"
import { useQuery } from "@tanstack/solid-query"
import { Link, useLocation, useMatchRoute, useParams } from "@tanstack/solid-router"
import type { FunctionReturnType } from "convex/server"
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	Index,
	Match,
	Suspense,
	Switch,
} from "solid-js"
import { IconAudio } from "~/components/icons/audio"
import { IconMutedAudio } from "~/components/icons/audio-muted"
import { IconBubbles } from "~/components/icons/bubbles"
import { IconDashboardLayout } from "~/components/icons/dashboard-layout"
import { IconHashtag } from "~/components/icons/hashtag"
import { IconHorizontalDots } from "~/components/icons/horizontal-dots"
import { IconPaperPlane } from "~/components/icons/paper-plane"
import { IconPhone } from "~/components/icons/phone"
import { IconPlus } from "~/components/icons/plus"
import { IconPlusSmall } from "~/components/icons/plus-small"
import { IconSupport } from "~/components/icons/support"
import { IconX } from "~/components/icons/x"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Dialog } from "~/components/ui/dialog"
import { Menu } from "~/components/ui/menu"
import { Sidebar } from "~/components/ui/sidebar"
import { IconSignOut } from "~/components/ui/signout"
import { Skeleton } from "~/components/ui/skeleton"
import { Tabs } from "~/components/ui/tabs"
import { UserAvatar } from "~/components/ui/user-avatar"
import { createMutation } from "~/lib/convex"
import { usePresenceState } from "~/lib/convex-presence"
import { convexQuery } from "~/lib/convex-query"
import { cn } from "~/lib/utils"
import { CreateChannelForm } from "./create-channel-form"
import { CreateDmDialog } from "./create-dm-dialog"
import { JoinPublicChannel } from "./join-public-channel"
import { NavUser } from "./nav-user"
import { WorkspaceSwitcher } from "./workspace-switcher"

export const AppSidebar = () => {
	const params = useParams({ from: "/_protected/_app/$serverId" })
	const serverId = createMemo(() => params().serverId as Id<"servers">)

	const location = useLocation()

	const currentPath = createMemo(() => {
		const pathSegments = location().pathname.split("/").filter(Boolean)

		return pathSegments[pathSegments.length - 1]
	})

	const meQuery = useQuery(() => ({
		...convexQuery(api.me.getUser, { serverId: serverId() }),
	}))

	const channelsQuery = useQuery(() => convexQuery(api.channels.getChannels, { serverId: serverId() }))

	const dmChannels = createMemo(() => channelsQuery.data?.dmChannels || [])

	const [createChannelModalOpen, setCreateChannelModalOpen] = createSignal(false)

	const presenceState = usePresenceState()

	return (
		<Sidebar collapsible="icon" class="overflow-hidden *:data-[sidebar=sidebar]:flex-row">
			<Sidebar collapsible="none" class="w-[calc(var(--sidebar-width-icon)+1px)]! border-r">
				<Sidebar.Header>
					<Suspense fallback={<Skeleton class="h-12 w-full rounded-md bg-muted" />}>
						<WorkspaceSwitcher />
					</Suspense>
				</Sidebar.Header>
				<Sidebar.Content>
					<Sidebar.Group>
						<Sidebar.GroupContent class="px-1.5 md:px-0">
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									class="px-2.5 md:px-2"
									as={Link}
									to="/$serverId"
									activeOptions={{
										exact: true,
									}}
									params={
										{
											serverId: serverId(),
										} as any
									}
								>
									<IconDashboardLayout />
									<span>Home</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
							<Sidebar.MenuItem>
								<Sidebar.MenuButton
									class="px-2.5 md:px-2"
									as={Link}
									to="/$serverId/chat"
									params={
										{
											serverId: serverId(),
										} as any
									}
								>
									<IconBubbles />
									<span>Chat</span>
								</Sidebar.MenuButton>
							</Sidebar.MenuItem>
						</Sidebar.GroupContent>
					</Sidebar.Group>
				</Sidebar.Content>
				<Sidebar.Footer>
					<Suspense fallback={<Skeleton class="h-12 w-full rounded-md bg-muted" />}>
						<NavUser serverId={serverId} />
					</Suspense>
				</Sidebar.Footer>
			</Sidebar>
			<Sidebar collapsible="none" class="hidden flex-1 md:flex">
				<Sidebar.Header class="gap-3.5 p-4">
					<div class="flex w-full items-center justify-between">
						<ActiveServer />
						{/* <IconPlus class="size-4" /> */}
					</div>
				</Sidebar.Header>
				<Sidebar.Content>
					<Suspense
						fallback={
							<div class="flex flex-col gap-2 p-3">
								<Sidebar.MenuSkeleton showIcon />
								<Sidebar.MenuSkeleton showIcon />
								<Sidebar.MenuSkeleton showIcon />
								<Sidebar.MenuSkeleton showIcon />
							</div>
						}
					>
						<Sidebar.Group>
							<Sidebar.GroupLabel>Favorites</Sidebar.GroupLabel>
							<Sidebar.Menu></Sidebar.Menu>
						</Sidebar.Group>
						<Sidebar.Group>
							<Sidebar.GroupLabel>Text Channels</Sidebar.GroupLabel>
							<Sidebar.GroupAction>
								<Dialog
									open={createChannelModalOpen()}
									onOpenChange={(details) => setCreateChannelModalOpen(details.open)}
								>
									<Dialog.Trigger
										class="text-muted-foreground"
										asChild={(props) => (
											<Button intent="ghost" size="icon" {...props}>
												<IconPlusSmall />
											</Button>
										)}
									/>
									<Dialog.Content>
										<Tabs defaultValue={"join"}>
											<Tabs.List>
												<Tabs.Trigger value="join">Join</Tabs.Trigger>
												<Tabs.Trigger value="create">Create New</Tabs.Trigger>
											</Tabs.List>
											<Tabs.Content value="join">
												<JoinPublicChannel
													serverId={serverId}
													onSuccess={() => setCreateChannelModalOpen(false)}
												/>
											</Tabs.Content>
											<Tabs.Content value="create">
												<CreateChannelForm
													serverId={serverId}
													onSuccess={() => setCreateChannelModalOpen(false)}
												/>
											</Tabs.Content>
										</Tabs>
									</Dialog.Content>
								</Dialog>
							</Sidebar.GroupAction>
							<Sidebar.Menu>
								<Index each={channelsQuery.data?.serverChannels}>
									{(channel) => <ChannelItem channel={channel} serverId={serverId} />}
								</Index>
							</Sidebar.Menu>
						</Sidebar.Group>
						<Sidebar.Group>
							<Sidebar.GroupLabel>Direct Messages</Sidebar.GroupLabel>
							<Sidebar.GroupAction>
								<CreateDmDialog serverId={serverId} />
							</Sidebar.GroupAction>
							<Sidebar.Menu>
								<Index each={dmChannels()}>
									{(channel) => (
										<DmChannelLink
											userPresence={presenceState.presenceList}
											channel={channel}
											serverId={serverId}
										/>
									)}
								</Index>
							</Sidebar.Menu>
						</Sidebar.Group>
					</Suspense>
				</Sidebar.Content>
			</Sidebar>
		</Sidebar>
	)
}

export interface ChannelItemProps {
	channel: Accessor<FunctionReturnType<typeof api.channels.getChannels>["serverChannels"][0]>
	serverId: Accessor<string>
}

export const ChannelItem = (props: ChannelItemProps) => {
	const params = createMemo(() => ({
		serverId: props.serverId(),
		id: props.channel()._id,
	}))

	const leaveChannel = createMutation(api.channels.leaveChannel)

	return (
		<Sidebar.MenuItem>
			<Sidebar.MenuButton as={Link} to="/$serverId/chat/$id" params={params() as any}>
				<IconHashtag class="size-5 text-muted-foreground" />
				<p
					class={cn(
						"text-ellipsis text-nowrap text-muted-foreground group-hover/sidebar-item:text-foreground",
						props.channel().isMuted && "opacity-60",
					)}
				>
					{props.channel().name}
				</p>
			</Sidebar.MenuButton>
			<Menu positioning={{ placement: "bottom" }}>
				<Menu.Trigger
					asChild={(props) => (
						<Sidebar.MenuAction
							showOnHover
							class="rounded-sm text-foreground data-[state=open]:bg-muted"
							{...props()}
						>
							<IconHorizontalDots class="text-foreground" />
							<span class="sr-only">More</span>
						</Sidebar.MenuAction>
					)}
				/>
				<Menu.Content>
					<MuteMenuItem
						channelId={() => props.channel()._id}
						serverId={props.serverId}
						isMuted={() => props.channel().isMuted}
					/>
					<Menu.Item
						class="flex items-center gap-2 text-destructive"
						value="close"
						onSelect={() => {
							leaveChannel({
								channelId: props.channel()._id as Id<"channels">,
								serverId: props.serverId() as Id<"servers">,
							})
						}}
					>
						<IconSignOut class="size-4" />
						Leave Channel
					</Menu.Item>
				</Menu.Content>
			</Menu>
		</Sidebar.MenuItem>
	)
}

interface DmChannelLinkProps {
	channel: Accessor<FunctionReturnType<typeof api.channels.getChannels>["dmChannels"][0]>
	serverId: Accessor<Id<"servers">>
	userPresence: Accessor<
		{
			userId: string
			online: boolean
			lastDisconnected: number
		}[]
	>
}

const DmChannelLink = (props: DmChannelLinkProps) => {
	const meQuery = useQuery(() => ({
		...convexQuery(api.me.getUser, { serverId: props.serverId() }),
	}))

	const params = createMemo(() => ({
		serverId: props.serverId(),
		id: props.channel()._id,
	}))

	const updateChannelPreferences = createMutation(api.channels.updateChannelPreferences)

	const filteredMembers = createMemo(() =>
		props.channel().members.filter((member) => member.userId !== meQuery.data?._id),
	)

	return (
		<Sidebar.MenuItem>
			<Sidebar.MenuButton as={Link} to="/$serverId/chat/$id" params={params() as any}>
				<div class="-space-x-4 flex items-center justify-center">
					<Switch>
						<Match when={props.channel().type === "single" && filteredMembers().length === 1}>
							<div class="flex items-center justify-center gap-3">
								<UserAvatar
									class="size-6"
									avatarUrl={filteredMembers()[0].user.avatarUrl}
									displayName={filteredMembers()[0].user.displayName}
									status={
										props
											.userPresence()
											.find((p) => p.userId === filteredMembers()[0].user._id)?.online
											? "online"
											: "offline"
									}
								/>

								<p
									class={cn(
										"truncate text-muted-foreground group-hover/sidebar-item:text-foreground",
										props.channel().isMuted && "opacity-60",
									)}
								>
									{filteredMembers()[0].user.displayName}
								</p>
							</div>
						</Match>
						<Match when={true}>
							<div class="-space-x-4 flex items-center justify-center">
								<Index each={filteredMembers()}>
									{(member) => (
										<div class="inline-block">
											<Avatar
												class="size-7"
												src={member().user.avatarUrl}
												name={member().user.displayName}
											/>
										</div>
									)}
								</Index>
								<p
									class={cn(
										"truncate text-muted-foreground group-hover/sidebar-item:text-foreground",
										props.channel().isMuted && "opacity-60",
									)}
								>
									{filteredMembers()
										.map((member) => member.user.displayName)
										.join(", ")}
								</p>
							</div>
						</Match>
					</Switch>
				</div>
			</Sidebar.MenuButton>

			<Menu positioning={{ placement: "bottom-start" }}>
				<Menu.Trigger
					asChild={(props) => (
						<Sidebar.MenuAction
							showOnHover
							class="rounded-sm text-foreground data-[state=open]:bg-muted"
							{...props()}
						>
							<IconHorizontalDots class="text-foreground" />
							<span class="sr-only">More</span>
						</Sidebar.MenuAction>
					)}
				/>
				<Menu.Content>
					<Menu.Item
						class="flex items-center gap-2"
						value="phone"
						onSelect={() => {
							console.log("TODO: Implement call")
						}}
					>
						<IconPhone class="size-4" />
						Call
					</Menu.Item>
					<Menu.Separator />
					<MuteMenuItem
						channelId={() => props.channel()._id}
						serverId={props.serverId}
						isMuted={() => props.channel().isMuted}
					/>
					<Menu.Item
						class="text-destructive"
						value="close"
						onSelect={async () => {
							await updateChannelPreferences({
								channelId: props.channel()._id as Id<"channels">,
								serverId: props.serverId() as Id<"servers">,
								isHidden: true,
							})
						}}
					>
						<IconX class="size-4" />
						Close
					</Menu.Item>
				</Menu.Content>
			</Menu>
		</Sidebar.MenuItem>
	)
}

const MuteMenuItem = (props: {
	channelId: Accessor<string>
	isMuted: Accessor<boolean>
	serverId: Accessor<string>
}) => {
	const updateChannelPreferences = createMutation(api.channels.updateChannelPreferences)

	return (
		<Menu.Item
			value="mute"
			onSelect={async () => {
				await updateChannelPreferences({
					channelId: props.channelId() as Id<"channels">,
					serverId: props.serverId() as Id<"servers">,
					isMuted: !props.isMuted(),
				})
			}}
		>
			{props.isMuted() ? <IconAudio class="size-4" /> : <IconMutedAudio class="size-4" />}
			{props.isMuted() ? "Unmute" : "Mute"}
		</Menu.Item>
	)
}

const ActiveServer = () => {
	const params = useParams({ from: "/_protected/_app/$serverId" })

	const serversQuery = useQuery(() => convexQuery(api.servers.getServersForUser, {}))

	const activeServer = createMemo(() =>
		serversQuery.data?.find((server) => server._id === params().serverId),
	)

	return (
		<Suspense>
			<div class="font-semibold text-foreground text-lg">{activeServer()?.name}</div>
		</Suspense>
	)
}
