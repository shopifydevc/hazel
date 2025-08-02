import { convexQuery } from "@convex-dev/react-query"
import type { Id } from "@hazel/backend"
import { api } from "@hazel/backend/api"
import { useQuery } from "@tanstack/react-query"
import { Avatar } from "../base/avatar/avatar"

interface MessageReplySectionProps {
	replyToMessageId: Id<"messages">
	channelId: Id<"channels">
	onClick?: () => void
}

export function MessageReplySection({ replyToMessageId, channelId, onClick }: MessageReplySectionProps) {
	const { data: organization } = useQuery(convexQuery(api.me.getOrganization, {}))
	const organizationId = organization?.directive === "success" ? organization.data._id : undefined

	const { data: replyMessage, isLoading } = useQuery(
		convexQuery(
			api.messages.getMessage,
			organizationId
				? {
						id: replyToMessageId,
						channelId,
						organizationId,
					}
				: "skip",
		),
	)

	return (
		<div className="relative">
			{/* Reply curve SVG */}
			<svg
				className="absolute top-2 left-8 rotate-180 text-secondary"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
			>
				<path
					d="M12 2 L12 8 Q12 12 8 12 L2 12"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					fill="none"
				/>
			</svg>

			{/* Reply content */}
			<button
				type="button"
				className="flex w-fit items-center gap-1 pl-12 text-left hover:bg-transparent"
				onClick={onClick}
			>
				{isLoading ? (
					<>
						<div className="size-4 animate-pulse rounded-full bg-quaternary" />
						<span className="text-secondary text-sm">Loading...</span>
					</>
				) : replyMessage ? (
					<>
						<Avatar
							size="xs"
							alt={`${replyMessage.author.firstName} ${replyMessage.author.lastName}`}
							src={replyMessage.author.avatarUrl}
						/>
						<span className="text-secondary text-sm hover:underline">
							{replyMessage.author.firstName} {replyMessage.author.lastName}
						</span>
						<span className="max-w-xs truncate text-ellipsis text-foreground text-xs">
							{replyMessage.content.split("\n")[0]}
						</span>
					</>
				) : (
					<span className="text-secondary text-sm">Message not found</span>
				)}
			</button>
		</div>
	)
}
