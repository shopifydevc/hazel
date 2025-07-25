import { cn } from "~/lib/utils"
import { Avatar } from "../base/avatar/avatar"

interface UserAvatarProps {
	className?: string
	avatarUrl?: string
	displayName: string
	status?: "online" | "offline"
}

export const UserAvatar = ({ className, avatarUrl, displayName, status }: UserAvatarProps) => {
	return (
		<div className="relative">
			<Avatar className={className} src={avatarUrl} alt={displayName[0]}></Avatar>
			{status && (
				<div
					className={cn(
						"absolute right-0 bottom-0 h-2 w-2 rounded-full border-2 border-background",
						status === "online" ? "bg-green-500" : "bg-gray-400",
					)}
				/>
			)}
		</div>
	)
}
