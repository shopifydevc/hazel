import { createFileRoute, Outlet } from "@tanstack/react-router"
import { SearchLg } from "@untitledui/icons"
import { useState } from "react"
import { TabList, Tabs } from "~/components/application/tabs/tabs"
import { Input } from "~/components/base/input/input"
import { NativeSelect } from "~/components/base/select/select-native"

export const Route = createFileRoute("/app/settings")({
	component: RouteComponent,
})

const tabs = [
	{ id: "profile", label: "Profile" },
	{ id: "appearance", label: "Appearance" },
	{ id: "team", label: "Team" },
	{ id: "billing", label: "Billing" },
	{ id: "email", label: "Email" },
	{ id: "notifications", label: "Notifications", badge: 2 },
	{ id: "integrations", label: "Integrations" },
]

function RouteComponent() {
	const [selectedTab, setSelectedTab] = useState<string>("appearance")

	return (
		<main className="min-w-0 flex-1 bg-primary pt-8 pb-12">
			<div className="flex flex-col gap-8">
				<div className="flex flex-col gap-5 px-4 lg:px-8">
					{/* Page header simple with search */}
					<div className="relative flex flex-col gap-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
							<div className="flex flex-col gap-0.5 lg:gap-1">
								<h1 className="font-semibold text-primary text-xl lg:text-display-xs">
									Settings
								</h1>
							</div>
							<div className="flex flex-col gap-4 lg:flex-row">
								<Input
									className="lg:w-80"
									size="sm"
									shortcut
									aria-label="Search"
									placeholder="Search"
									icon={SearchLg}
								/>
							</div>
						</div>
					</div>

					<div className="md:hidden">
						<NativeSelect
							value={selectedTab}
							onChange={(event) => setSelectedTab(event.target.value)}
							options={tabs.map((tab) => ({ label: tab.label, value: tab.id }))}
						/>
					</div>

					<div className="-mx-4 -my-1 scrollbar-hide lg:-mx-8 flex overflow-auto px-4 py-1 lg:px-8">
						<Tabs
							className="flex w-max items-start max-md:hidden"
							selectedKey={selectedTab}
							onSelectionChange={(value) => setSelectedTab(value as string)}
						>
							<TabList type="button-border" className="w-full" items={tabs} />
						</Tabs>
					</div>
				</div>
				<Outlet />
			</div>
		</main>
	)
}
