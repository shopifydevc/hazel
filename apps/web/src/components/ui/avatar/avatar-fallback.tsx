import type { FC, ReactNode } from "react"
import IconCircleDottedUser from "~/components/icons/icon-circle-dotted-user"
import { cx } from "~/utils/cx"
import { useAvatarContext } from "./avatar-context"
import { styles } from "./styles"

export interface AvatarFallbackProps {
	children?: ReactNode
	icon?: FC<{ className?: string }>
	className?: string
}

export function AvatarFallback({ children, icon: Icon, className }: AvatarFallbackProps) {
	const { size, imageShowing } = useAvatarContext()

	// Only render fallback when image is not showing (no src or failed to load)
	if (imageShowing) return null

	if (typeof children === "string") {
		return <span className={cx("text-quaternary", styles[size].initials, className)}>{children}</span>
	}

	if (Icon) {
		return <Icon className={cx("text-muted-fg", styles[size].icon, className)} />
	}

	if (children) {
		return <>{children}</>
	}

	return <IconCircleDottedUser className={cx("text-muted-fg", styles[size].icon, className)} />
}
