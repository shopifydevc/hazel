import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute("/app/$orgId")({
	component: RouteComponent,
})

function RouteComponent() {
	return <Outlet />
}