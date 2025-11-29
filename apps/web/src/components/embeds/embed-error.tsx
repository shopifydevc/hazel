"use client"

import { cn } from "~/lib/utils"
import { embedContainerStyles } from "./embed"

export interface EmbedErrorProps {
	/** Icon URL for the provider (shows in error state) */
	iconUrl?: string
	/** Error message to display */
	message?: string
	/** Accent color for the left border */
	accentColor?: string
	/** Additional class names */
	className?: string
}

/**
 * Error state for embeds when content fails to load.
 */
export function EmbedError({
	iconUrl,
	message = "Could not load content",
	accentColor,
	className,
}: EmbedErrorProps) {
	return (
		<div
			className={cn(embedContainerStyles({ variant: "error" }), className)}
			style={{
				borderLeftColor: accentColor || "var(--color-border)",
			}}
		>
			{iconUrl && <img src={iconUrl} alt="" className="size-5 opacity-50" />}
			<span className="text-muted-fg text-sm">{message}</span>
		</div>
	)
}
