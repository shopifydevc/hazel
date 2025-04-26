import { Splitter } from "@ark-ui/solid"
import { createFileRoute } from "@tanstack/solid-router"
import { ClerkLoaded, ClerkLoading, SignInButton, SignedIn, SignedOut, UserButton, useAuth } from "clerk-solidjs"
import { Sidebar } from "../../components/sidebar"

export const Route = createFileRoute("/_app/")({
	component: App,
})

function App() {
	const { userId } = useAuth()

	return (
		<main class="flex w-full">
			<Splitter.Root panels={[{ id: "a", minSize: 15, maxSize: 20 }, { id: "b" }]}>
				<Splitter.Panel id="a">
					<Sidebar />
				</Splitter.Panel>
				<Splitter.ResizeTrigger class="h-12 w-1 bg-primary" id="a:b" aria-label="Resize" />
				<Splitter.Panel id="b">
					<ClerkLoading>
						<p>Loading...</p>
					</ClerkLoading>
					<ClerkLoaded>
						<SignedIn>
							<UserButton />
							<p>Welcome, {userId()}</p>
						</SignedIn>
						<SignedOut>
							<SignInButton />
						</SignedOut>
					</ClerkLoaded>
				</Splitter.Panel>
			</Splitter.Root>
		</main>
	)
}
