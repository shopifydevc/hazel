import { Navigate, Outlet } from "@tanstack/react-router"
import { useAuth } from "@workos-inc/authkit-react"

export function AuthLayout() {
	const { user, isLoading } = useAuth()

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-gray-900 border-b-2"></div>
			</div>
		)
	}

	if (!user) {
		return (
			<Navigate
				to="/login"
				search={{
					returnTo: location.pathname,
				}}
			/>
		)
	}

	return <Outlet />
}
