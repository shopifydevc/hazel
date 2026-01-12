import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { MessageList } from "~/components/chat/message-list"
import { SlateMessageComposer } from "~/components/chat/slate-editor/slate-message-composer"
import { TypingIndicator } from "~/components/chat/typing-indicator"

export const Route = createFileRoute("/_app/$orgSlug/chat/$id/")({
	component: MessagesRoute,
})

function MessagesRoute() {
	const { messageId } = Route.useSearch()
	const navigate = Route.useNavigate()

	// TODO: Implement scroll-to-message - see GitHub issue
	// Clear messageId from URL when present (scroll functionality not yet implemented)
	useEffect(() => {
		if (messageId) {
			navigate({ search: {}, replace: true })
		}
	}, [messageId, navigate])

	return (
		<>
			<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
				<MessageList />
			</div>
			<div className="shrink-0 px-4 pt-2.5">
				<SlateMessageComposer />
				<TypingIndicator />
			</div>
		</>
	)
}
