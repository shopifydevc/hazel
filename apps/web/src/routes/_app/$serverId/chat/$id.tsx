import { createFileRoute, useParams } from "@tanstack/solid-router"
import { createMemo, createSignal, Show } from "solid-js"
import { ChatTopbar } from "~/components/chat-ui/chat-topbar"

import { Channel } from "./-components/channel"
import { Button } from "~/components/ui/button"
import { IconX } from "~/components/icons/x"

export const chatStore$ = createSignal({
	replyToMessageId: null as string | null,
	openThreadId: null as string | null,
})

export const Route = createFileRoute("/_app/$serverId/chat/$id")({
	component: RouteComponent,
})

function RouteComponent() {
	const [chatStore, setChatStore] = chatStore$

	const params = useParams({ from: "/_app/$serverId/chat/$id" })
	const channelId = createMemo(() => params().id)
	const serverId = createMemo(() => params().serverId)

	const threadChannelId = createMemo(() => chatStore().openThreadId)

	return (
		<div class="flex h-screen flex-col">
			<ChatTopbar />
			<div class="flex flex-1">
				<Channel channelId={channelId} serverId={serverId} />
				<Show when={threadChannelId()}>
					<ThreadChannel channelId={threadChannelId()!} serverId={serverId()} />
				</Show>
			</div>
		</div>
	)
}

function ThreadChannel(props: { channelId: string; serverId: string }) {
	const channelId = createMemo(() => props.channelId)
	const serverId = createMemo(() => props.serverId)

	return (
		<div class="flex flex-1 flex-col border-l">
			<div class="flex items-center justify-between border-b bg-sidebar p-4">
				<p>Thread</p>
				<Button intent="ghost" size="icon-small">
					<IconX class="size-4" />
				</Button>
			</div>
			<Channel channelId={channelId} serverId={serverId} />
		</div>
	)
}
