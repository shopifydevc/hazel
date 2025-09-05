import { AuthKitProvider, useAuth } from "@workos-inc/authkit-react"

export const WorkOsProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<AuthKitProvider
			clientId={import.meta.env.VITE_WORKOS_CLIENT_ID || "client_01HGZR2CV5G9VPBYK6XFA8YG17"}
			redirectUri={import.meta.env.VITE_WORKOS_REDIRECT_URI}
		>
			{children}
		</AuthKitProvider>
	)
}
