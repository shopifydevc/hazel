import { Outlet, createFileRoute } from "@tanstack/solid-router"
import { createEffect, createMemo } from "solid-js"
import { Sidebar } from "~/components/ui/sidebar"
import { removeCurrentServerId, setCurrentServerId } from "~/lib/helpers/localstorage"
import { useServer } from "~/lib/hooks/data/use-server"
import { AblyProvider } from "~/lib/services/ably"
import { AppSidebar } from "~/routes/_app/$serverId/-components/app-sidebar"

export const Route = createFileRoute("/_app/$serverId")({
	component: RouteComponent,
})

function RouteComponent() {
	const params = Route.useParams()
	const navigate = Route.useNavigate()

	const serverId = createMemo(() => params().serverId)

	const { server, isLoading } = useServer(serverId)

	createEffect(() => {
		if (!isLoading() && !server()) {
			removeCurrentServerId()
			throw navigate({
				to: "/",
			})
		}
	})

	// Saves the current serverId to local storage
	createEffect(() => {
		const currentServerId = serverId()
		if (currentServerId) {
			setCurrentServerId(currentServerId)
		}
	})

	return (
		<AblyProvider>
			<Sidebar.Provider>
				<AppSidebar />
				{/* <div class="fixed inset-y-0 border-r bg-sidebar/90 pb-4 lg:left-0 lg:z-50 lg:block lg:w-14 lg:overflow-y-auto">
				<ServerSelectSidebar />
			</div> */}
				<Sidebar.Inset>
					<Outlet />
				</Sidebar.Inset>
			</Sidebar.Provider>
		</AblyProvider>
	)
}
