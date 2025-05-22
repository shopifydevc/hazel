import { useChat } from "../chat-state/chat-store"

export const ChatTypingPresence = () => {
	const { state } = useChat()

	return (
		<div>
			{state.typingUserIds.length > 0 && (
				<div>
					{state.typingUserIds.map((userId) => (
						<div>{userId}</div>
					))}
				</div>
			)}
		</div>
	)
}
