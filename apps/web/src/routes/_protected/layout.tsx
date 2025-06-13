import { Navigate, Outlet, createFileRoute, useRouter } from "@tanstack/solid-router"
import { useConvexAuth } from "~/lib/convex/convex-auth-state"

import { Match, Switch } from "solid-js"

export const Route = createFileRoute("/_protected")({
	component: RouteComponent,
})

function RouteComponent() {
	const { isLoading, isAuthenticated } = useConvexAuth()

	return (
		<Switch>
			<Match when={!isAuthenticated() && !isLoading()}>
				<Navigate to="/sign-in" search={{ redirectTo: window.location.pathname }} />
			</Match>

			<Match when={isAuthenticated() && !isLoading()}>
				<Outlet />
			</Match>
		</Switch>
	)
}
