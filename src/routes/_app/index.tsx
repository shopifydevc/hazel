import { Link, createFileRoute } from "@tanstack/solid-router"
import { For } from "solid-js"
import { Card } from "~/components/ui/card"
import { useUserServers } from "~/lib/hooks/data/use-user-servers"

export const Route = createFileRoute("/_app/")({
	component: App,
})

function App() {
	const { servers } = useUserServers()

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
