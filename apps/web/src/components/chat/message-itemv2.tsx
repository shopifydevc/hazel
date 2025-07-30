import type { api } from "@hazel/backend/api"
import type { FunctionReturnType } from "convex/server"
import { format } from "date-fns"
import { cx } from "~/utils/cx"
import { Avatar } from "../base/avatar/avatar"
import { Badge, BadgeIcon } from "../base/badges/badges"
import { TextEditor } from "./read-only-message"

type Message = FunctionReturnType<typeof api.messages.getMessages>["page"][0]

interface MessageItemProps {
	message: Message
	isGroupStart?: boolean
	isGroupEnd?: boolean
	isFirstNewMessage?: boolean
	isPinned?: boolean
}

export function MessageItem2({
	message,
	isGroupStart = false,
	isGroupEnd = false,
	isFirstNewMessage = false,
	isPinned = false,
}: MessageItemProps) {
	const showAvatar = isGroupStart || !!message.replyToMessageId
	const isRepliedTo = !!message.replyToMessageId

	return (
		<div
			id={`message-${message._id}`}
			className={cx(`group relative flex flex-col px-4 py-0.5 transition-colors hover:bg-muted/50 rounded-l-none${isGroupStart ? "mt-2" : ""}
				${isGroupEnd ? "mb-2" : ""}
				${isFirstNewMessage ? "border-emerald-500 border-l-2 bg-emerald-500/20 hover:bg-emerald-500/15" : ""}
				${isPinned ? "border-primary border-l-2 bg-primary/20 hover:bg-primary/15" : ""}
			`)}
			data-id={message._id}
		>
			{/* Reply Section */}
			{isRepliedTo && (
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

					{/* Reply content placeholder */}
					<button
						type="button"
						className="flex w-fit items-center gap-1 pl-12 text-left hover:bg-transparent"
					>
						<div className="size-4 rounded-full bg-muted" />
						<span className="text-secondary text-sm hover:underline">@ReplyAuthor</span>
						<span className="text-ellipsis text-foreground text-xs">
							Reply content preview...
						</span>
					</button>
				</div>
			)}

			{/* Main Content Row */}
			<div className="flex gap-4">
				{showAvatar ? (
					<Avatar
						size="md"
						alt={`${message.author.firstName} ${message.author.lastName}`}
						src={message.author.avatarUrl}
					/>
				) : (
					<div className="flex w-10 items-center justify-end pr-1 text-[10px] text-secondary leading-tight opacity-0 group-hover:opacity-100">
						{format(message._creationTime, "HH:mm")}
					</div>
				)}

				{/* Content Section */}
				<div className="min-w-0 flex-1">
					{/* Author header (only when showing avatar) */}
					{showAvatar && (
						<div className="flex items-baseline gap-2">
							<span className="font-semibold">
								{message.author
									? `${message.author.firstName} ${message.author.lastName}`
									: "Unknown"}
							</span>
							<span className="text-secondary text-xs">
								{format(message._creationTime, "HH:mm")}
							</span>
						</div>
					)}

					{/* Message Content */}
					<TextEditor.Root content={message.jsonContent}>
						<TextEditor.Content readOnly />
					</TextEditor.Root>

					{/* Attachments Grid Placeholder */}
					{message.attachedFiles && message.attachedFiles.length > 0 && (
						<div
							className={`mt-2 grid max-w-lg gap-1${message.attachedFiles.length === 1 ? "grid-cols-1" : "grid-cols-2"}
							${message.attachedFiles.length === 3 ? "grid-cols-3" : ""}
						`}
						>
							{message.attachedFiles.slice(0, 4).map((file, index) => (
								<div
									key={file}
									className={`relative aspect-square cursor-pointer overflow-hidden rounded transition-opacity hover:opacity-90${message.attachedFiles!.length === 1 ? "col-span-2 aspect-auto max-w-[400px]" : ""}
										${message.attachedFiles!.length === 3 && index === 0 ? "col-span-2 row-span-2" : ""}
									`}
								>
									<div className="h-full w-full bg-muted" />
									{message.attachedFiles!.length > 4 && index === 3 && (
										<div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/60">
											<span className="font-semibold text-lg text-white">
												+{message.attachedFiles!.length - 4}
											</span>
										</div>
									)}
								</div>
							))}
						</div>
					)}

					{/* Reactions Placeholder */}
					<div className="mt-1 flex flex-wrap gap-1">
						{message.reactions.map((reaction) => (
							<BadgeIcon
								key={reaction.emoji}
								color="brand"
								size="lg"
								icon={(props) => <span {...props}>{reaction.emoji}</span>}
							/>
						))}
					</div>

					{/* Thread Button Placeholder */}
					{message.threadChannelId && (
						<button
							type="button"
							className="mt-2 flex items-center gap-2 text-secondary text-sm hover:text-primary"
						>
							<div className="size-4 rounded bg-muted-foreground/20" />
							<span>Thread replies</span>
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
