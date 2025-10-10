import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { VersionCheck } from "~/components/version-check"

export const Route = createRootRouteWithContext<{}>()({
	component: () => (
		<>
			<Outlet />
			<VersionCheck />
			{/* <TanStackRouterDevtools position="top-right" /> */}
		</>
	),
})
