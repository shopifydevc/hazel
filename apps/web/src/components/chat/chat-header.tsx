import type { UserId } from "@hazel/db/schema"
import { Avatar } from "~/components/base/avatar/avatar"
import { Tooltip, TooltipTrigger } from "~/components/base/tooltip/tooltip"
import IconHashtag from "~/components/icons/icon-hashtag"
import { useChannel } from "~/db/hooks"
import { useChat } from "~/hooks/use-chat"
import { useUserPresence } from "~/hooks/use-presence"
import { useAuth } from "~/lib/auth"
import { ButtonUtility } from "../base/buttons/button-utility"
import IconPhone from "../icons/icon-phone"
import { PinnedMessagesModal } from "./pinned-messages-modal"

interface OtherMemberAvatarProps {
	member: {
		userId: UserId
		user: {
			avatarUrl?: string | null
			firstName: string
			lastName: string
		}
	}
}

function OtherMemberAvatar({ member }: OtherMemberAvatarProps) {
	const { isOnline } = useUserPresence(member.userId)

	return (
		<Avatar
			size="sm"
			src={member.user.avatarUrl}
			alt={`${member.user.firstName} ${member.user.lastName}`}
			status={isOnline ? "online" : "offline"}
		/>
	)
}

export function ChatHeader() {
	const { channelId } = useChat()
	const { user } = useAuth()

	const { channel } = useChannel(channelId)

	if (!channel) {
		return (
			<div className="flex h-14 flex-shrink-0 items-center border-sidebar-border border-b px-4">
				<div className="h-4 w-32 animate-pulse rounded bg-muted" />
			</div>
		)
	}

	const isDirectMessage = channel.type === "direct" || channel.type === "single"
	const otherMembers = channel.members.filter((member) => member.userId !== user?.id)

	return (
		<div className="flex h-14 flex-shrink-0 items-center justify-between border-sidebar-border border-b bg-sidebar px-4">
			<div className="flex items-center gap-3">
				{isDirectMessage ? (
					<>
						{otherMembers && otherMembers.length > 0 && otherMembers[0] && (
							<OtherMemberAvatar member={otherMembers[0]} />
						)}
						<div>
							<h2 className="font-semibold text-sm">
								{otherMembers
									.slice(0, 3)
									?.map((member) => `${member.user.firstName} ${member.user.lastName}`)
									.join(", ") || "Direct Message"}{" "}
								<Tooltip
									arrow
									title={otherMembers
										?.map((member) => `${member.user.firstName} ${member.user.lastName}`)
										.join(", ")}
								>
									<TooltipTrigger className="font-normal text-secondary text-xs">
										{otherMembers.length > 3 && ` +${otherMembers.length - 3} more`}
									</TooltipTrigger>
								</Tooltip>
							</h2>
						</div>
					</>
				) : (
					<>
						<IconHashtag className="size-5 text-secondary" />
						<div>
							<h2 className="font-semibold text-sm">{channel.name}</h2>
						</div>
					</>
				)}
			</div>

			<div className="flex items-center gap-2">
				<ButtonUtility
					to="/$orgSlug/call"
					params={{
						orgSlug: channel.organizationId,
					}}
					size="sm"
					color="tertiary"
					tooltip="Call"
					icon={IconPhone}
				/>

				<PinnedMessagesModal />
			</div>
		</div>
	)
}
