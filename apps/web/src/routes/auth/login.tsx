import { createFileRoute, Navigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useAuth } from "../../lib/auth"

export const Route = createFileRoute("/auth/login")({
	component: LoginPage,
	validateSearch: (search: Record<string, unknown>) => {
		return {
			returnTo: search.returnTo as string | undefined,
		}
	},
})

function LoginPage() {
	const { user, login, isLoading } = useAuth()
	const search = Route.useSearch()
	const [isRedirecting, setIsRedirecting] = useState(false)

	useEffect(() => {
		if (!user && !isLoading && !isRedirecting) {
			// Login navigates directly to the backend which redirects to WorkOS
			setIsRedirecting(true)
			login({ returnTo: `${location.origin}${search.returnTo}` || location.href })
		}
	}, [user, isLoading, login, search.returnTo, isRedirecting])

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-border border-b-2"></div>
			</div>
		)
	}

	if (user) {
		return <Navigate to={search.returnTo || "/"} />
	}

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<h1 className="mb-4 font-semibold text-2xl">Redirecting to login...</h1>
				<div className="mx-auto h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2"></div>
			</div>
		</div>
	)
}
