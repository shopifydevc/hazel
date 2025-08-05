import type { Id } from "@hazel/backend"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef } from "react"
import { ChatHeader } from "~/components/chat/chat-header"
import { MessageComposer, type MessageComposerRef } from "~/components/chat/message-composer"
import { MessageList } from "~/components/chat/message-list"
import { TypingIndicator } from "~/components/chat/typing-indicator"
import { ChatProvider } from "~/providers/chat-provider"

export const Route = createFileRoute("/app/chat/$id")({
	component: RouteComponent,
})

function RouteComponent() {
	const { id } = Route.useParams()
	const messageComposerRef = useRef<MessageComposerRef>(null)

	useEffect(() => {
		const handleGlobalKeyDown = (event: KeyboardEvent) => {
			// Check if the event target is an input, textarea, or contenteditable element
			const target = event.target as HTMLElement
			const isInputElement =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.contentEditable === "true" ||
				target.closest('[contenteditable="true"]')

			// Skip if user is already typing in an input field
			if (isInputElement) {
				return
			}

			// Skip if user is pressing modifier keys
			if (event.ctrlKey || event.altKey || event.metaKey) {
				return
			}

			// Check if it's a printable character or space
			const isPrintableChar = event.key.length === 1

			if (isPrintableChar) {
				event.preventDefault()
				messageComposerRef.current?.focusAndInsertText(event.key)
			}
		}

		document.addEventListener("keydown", handleGlobalKeyDown)

		return () => {
			document.removeEventListener("keydown", handleGlobalKeyDown)
		}
	}, [])

	return (
		<ChatProvider channelId={id as Id<"channels">}>
			<div className="flex h-screen flex-col">
				<ChatHeader />
				<div className="flex-1 overflow-hidden">
					<MessageList />
				</div>
				<div className="px-4 pt-2 pb-4">
					<MessageComposer ref={messageComposerRef} />
					<TypingIndicator />
				</div>
			</div>
		</ChatProvider>
	)
}
