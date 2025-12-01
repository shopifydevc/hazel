import { createFileRoute, Outlet } from "@tanstack/react-router"
import { useState } from "react"
import type { CommandPalettePage } from "~/atoms/command-palette-atoms"
import { CommandPalette } from "~/components/command-palette"
import { Loader } from "~/components/loader"
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar"
import {
	attachmentCollection,
	channelCollection,
	channelMemberCollection,
	organizationCollection,
	organizationMemberCollection,
} from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { NotificationSoundProvider } from "~/providers/notification-sound-provider"
import { PresenceProvider } from "~/providers/presence-provider"

export const Route = createFileRoute("/_app/$orgSlug")({
	component: RouteComponent,
	loader: async () => {
		// TODO: Should be scoped to the organization
		await channelCollection.preload()
		await channelMemberCollection.preload()
		await attachmentCollection.preload()

		await organizationCollection.preload()
		await organizationMemberCollection.preload()

		return null
	},
})

function RouteComponent() {
	const { user, login, isLoading: isAuthLoading } = useAuth()
	const { organizationId, isLoading: isOrgLoading } = useOrganization()
	const [openCmd, setOpenCmd] = useState(false)
	const [initialPage, setInitialPage] = useState<CommandPalettePage>("home")

	// Wait for both auth and org to finish loading before making redirect decisions
	// This prevents redirect loops when user data hasn't loaded yet
	if (isAuthLoading || isOrgLoading) {
		return <Loader />
	}

	// If user IS authenticated but lacks org context, redirect them to login with org context
	// Note: `user &&` ensures we don't redirect while user is null (not authenticated)
	if (user && !user.organizationId && organizationId) {
		login({ organizationId, returnTo: window.location.pathname })
		return <Loader />
	}

	const openChannelsBrowser = () => {
		setInitialPage("channels")
		setOpenCmd(true)
	}

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "350px",
				} as React.CSSProperties
			}
		>
			<PresenceProvider>
				<NotificationSoundProvider>
					<AppSidebar openChannelsBrowser={openChannelsBrowser} />
					<SidebarInset>
						<Outlet />
						<CommandPalette
							isOpen={openCmd}
							onOpenChange={setOpenCmd}
							initialPage={initialPage}
						/>
					</SidebarInset>
				</NotificationSoundProvider>
			</PresenceProvider>
		</SidebarProvider>
	)
}
