import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router"
import { Loader } from "~/components/loader"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"
import { useAuth } from "~/lib/auth"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	loader: async () => {
		await organizationCollection.preload()
		await organizationMemberCollection.preload()

		return null
	},
})

function RouteComponent() {
	const { user, isLoading } = useAuth()
	const isRouterPending = useRouterState({ select: (s) => s.status === "pending" })
	const showLoader = isLoading || isRouterPending

	// Redirect unauthenticated users directly to backend login endpoint
	// This skips the intermediate "Redirecting to login..." page
	if (!user && !showLoader) {
		const returnTo = encodeURIComponent(window.location.href)
		const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"
		window.location.href = `${backendUrl}/auth/login?returnTo=${returnTo}`
		return <Loader />
	}

	return showLoader ? <Loader /> : <Outlet />
}
