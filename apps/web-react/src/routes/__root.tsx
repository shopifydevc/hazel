import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { useAuth } from "@workos-inc/authkit-react"

export const Route = createRootRoute({
	component: RootComponent,
})

function RootComponent() {
	const { isLoading } = useAuth()

	if (isLoading) {
		return <div className="flex h-screen items-center justify-center">Loading</div>
	}

	return (
		<>
			<Outlet />
			<TanStackRouterDevtools />
		</>
	)
}
