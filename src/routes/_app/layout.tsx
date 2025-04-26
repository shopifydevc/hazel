import { Outlet, createFileRoute } from "@tanstack/solid-router"

import { ClerkProvider } from "clerk-solidjs"
import { Suspense } from "solid-js"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
			<Suspense>
				<Outlet />
			</Suspense>
		</ClerkProvider>
	)
}
