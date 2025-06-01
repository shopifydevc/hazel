import { Link, createFileRoute, useNavigate } from "@tanstack/solid-router"
import { For, createEffect, createMemo } from "solid-js"
import { Card } from "~/components/ui/card"
import { getCurrentServerId } from "~/lib/helpers/localstorage"
import { useUserServers } from "~/lib/hooks/data/use-user-servers"

export const Route = createFileRoute("/_app/")({
	component: App,
})

function App() {
	const navigate = useNavigate()
	const { servers, isLoading } = useUserServers()

	createEffect(() => {
		if (!isLoading() && servers().length === 0) {
			navigate({
				to: "/onboarding",
			})
		}
	})

	createEffect(() => {
		const savedServerId = getCurrentServerId()

		if (savedServerId) {
			navigate({
				to: "/$serverId",
				params: {
					serverId: savedServerId,
				},
			})
		}
	})

	return (
		<main class="container mx-auto flex w-full py-14">
			<div class="flex flex-row gap-3">
				<For each={servers()}>
					{(server) => (
						<Link to="/$serverId" params={{ serverId: server.id }}>
							<Card>
								<Card.Header>
									<Card.Title>{server.name}</Card.Title>
									<Card.Description>{server.owner?.displayName}</Card.Description>
								</Card.Header>
							</Card>
						</Link>
					)}
				</For>
			</div>
		</main>
	)
}
