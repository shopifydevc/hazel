import { createFileRoute, Outlet } from "@tanstack/react-router"
import { organizationCollection, organizationMemberCollection } from "~/db/collections"

export const Route = createFileRoute("/_app")({
	component: RouteComponent,
	loader: async () => {
		await organizationCollection.preload()
		await organizationMemberCollection.preload()
		return null
	},
})

function RouteComponent() {
	return <Outlet />
}
