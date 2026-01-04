import { createFileRoute, Link } from "@tanstack/react-router"
import { MessageEmbeds } from "~/components/chat/message-embeds"

export const Route = createFileRoute("/dev/embeds/railway")({
	component: RouteComponent,
})

const RAILWAY_AVATAR = "https://cdn.brandfetch.io/railway.com/w/64/h/64/theme/dark/icon"

// Railway event colors (matching backend)
const RAILWAY_COLORS = {
	deployed: 0x10b981,
	crashed: 0xef4444,
	building: 0x3b82f6,
	queued: 0x6366f1,
	needsApproval: 0xf59e0b,
	removed: 0x6b7280,
	triggered: 0xf59e0b,
	resolved: 0x10b981,
} as const

// Mock Railway embeds
const railwayEmbeds = {
	// Deployment success states
	deployed: {
		title: "api-service in hazel-app",
		description: "Environment: **production**",
		color: RAILWAY_COLORS.deployed,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [
			{ name: "Branch", value: "main", inline: true },
			{
				name: "Commit",
				value: "`a3f2d1e` - feat: add webhook support",
				inline: false,
			},
			{ name: "Author", value: "johndoe", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Deployed", color: RAILWAY_COLORS.deployed },
	},

	redeployed: {
		title: "web-frontend in hazel-app",
		description: "Environment: **staging**",
		color: RAILWAY_COLORS.deployed,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [
			{ name: "Branch", value: "develop", inline: true },
			{
				name: "Commit",
				value: "`b4c5e8f` - fix: resolve CSS issues",
				inline: false,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Redeployed", color: RAILWAY_COLORS.deployed },
	},

	// Deployment error states
	crashed: {
		title: "worker-service in hazel-app",
		description: "Environment: **production**",
		color: RAILWAY_COLORS.crashed,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [
			{ name: "Branch", value: "main", inline: true },
			{
				name: "Commit",
				value: "`c7d9a2b` - refactor: update dependencies",
				inline: false,
			},
			{ name: "Severity", value: "ERROR", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Crashed", color: RAILWAY_COLORS.crashed },
	},

	oomKilled: {
		title: "data-processor in analytics",
		description: "Environment: **production**",
		color: RAILWAY_COLORS.crashed,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Analytics Team" },
		fields: [
			{ name: "Branch", value: "main", inline: true },
			{ name: "Severity", value: "CRITICAL", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "OOM Killed", color: RAILWAY_COLORS.crashed },
	},

	failed: {
		title: "backend-api in hazel-app",
		description: "Environment: **staging**",
		color: RAILWAY_COLORS.crashed,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [
			{ name: "Branch", value: "feature/new-api", inline: true },
			{
				name: "Commit",
				value: "`e1f2g3h` - WIP: new endpoint",
				inline: false,
			},
			{ name: "Severity", value: "ERROR", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Failed", color: RAILWAY_COLORS.crashed },
	},

	// Deployment progress states
	building: {
		title: "web-app in hazel-app",
		description: "Environment: **production**",
		color: RAILWAY_COLORS.building,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [
			{ name: "Branch", value: "main", inline: true },
			{
				name: "Commit",
				value: "`d8e9f0a` - chore: update build config",
				inline: false,
			},
			{ name: "Source", value: "Manual Deploy", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Building", color: RAILWAY_COLORS.building },
	},

	deploying: {
		title: "api-gateway in hazel-app",
		description: "Environment: **production**",
		color: RAILWAY_COLORS.building,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [
			{ name: "Branch", value: "main", inline: true },
			{
				name: "Commit",
				value: "`f1a2b3c` - feat: add rate limiting",
				inline: false,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Deploying", color: RAILWAY_COLORS.building },
	},

	restarted: {
		title: "cache-service in hazel-app",
		description: "Environment: **production**",
		color: RAILWAY_COLORS.building,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [{ name: "Branch", value: "main", inline: true }],
		timestamp: new Date().toISOString(),
		badge: { text: "Restarted", color: RAILWAY_COLORS.building },
	},

	// Deployment pending states
	queued: {
		title: "batch-processor in hazel-app",
		description: "Environment: **staging**",
		color: RAILWAY_COLORS.queued,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [
			{ name: "Branch", value: "develop", inline: true },
			{
				name: "Commit",
				value: "`g4h5i6j` - feat: add batch support",
				inline: false,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Queued", color: RAILWAY_COLORS.queued },
	},

	needsApproval: {
		title: "database-migrator in hazel-app",
		description: "Environment: **production**",
		color: RAILWAY_COLORS.needsApproval,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [
			{ name: "Branch", value: "main", inline: true },
			{
				name: "Commit",
				value: "`h7i8j9k` - migration: add new tables",
				inline: false,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Needs Approval", color: RAILWAY_COLORS.needsApproval },
	},

	// Deployment neutral states
	removed: {
		title: "old-service in hazel-app",
		description: "Environment: **staging**",
		color: RAILWAY_COLORS.removed,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		timestamp: new Date().toISOString(),
		badge: { text: "Removed", color: RAILWAY_COLORS.removed },
	},

	slept: {
		title: "dev-server in hazel-app",
		description: "Environment: **development**",
		color: RAILWAY_COLORS.removed,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		timestamp: new Date().toISOString(),
		badge: { text: "Slept", color: RAILWAY_COLORS.removed },
	},

	// Alert states
	alertTriggered: {
		title: "api-service in hazel-app",
		description: "Volume Alert",
		color: RAILWAY_COLORS.triggered,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		fields: [{ name: "Severity", value: "WARNING", inline: true }],
		timestamp: new Date().toISOString(),
		badge: { text: "Triggered", color: RAILWAY_COLORS.triggered },
	},

	alertResolved: {
		title: "api-service in hazel-app",
		description: "Volume Alert",
		color: RAILWAY_COLORS.resolved,
		author: {
			name: "Railway",
			url: "https://railway.app",
			iconUrl: RAILWAY_AVATAR,
		},
		footer: { text: "Hazel Team" },
		timestamp: new Date().toISOString(),
		badge: { text: "Resolved", color: RAILWAY_COLORS.resolved },
	},
}

function EmbedSection({
	title,
	children,
}: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-4">
			<h2 className="font-semibold text-fg text-lg">{title}</h2>
			<div className="grid gap-4 md:grid-cols-2">{children}</div>
		</div>
	)
}

function EmbedPreview({
	label,
	embed,
}: { label: string; embed: (typeof railwayEmbeds)[keyof typeof railwayEmbeds] }) {
	return (
		<div className="space-y-2">
			<span className="font-mono text-muted-fg text-xs">{label}</span>
			<MessageEmbeds embeds={[embed]} />
		</div>
	)
}

function RouteComponent() {
	return (
		<div className="min-h-screen bg-bg p-8">
			<div className="mx-auto max-w-5xl space-y-12">
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<Link to="/dev/embeds" className="text-muted-fg hover:text-fg">
							Embeds
						</Link>
						<span className="text-muted-fg">/</span>
						<span className="text-fg">Railway</span>
					</div>
					<h1 className="font-bold text-2xl text-fg">Railway Webhook Embeds</h1>
					<p className="text-muted-fg">
						Preview of Railway deployment and alert webhook embed cards.
					</p>
				</div>

				<EmbedSection title="Deployment Success">
					<EmbedPreview label="Deployment.deployed" embed={railwayEmbeds.deployed} />
					<EmbedPreview label="Deployment.redeployed" embed={railwayEmbeds.redeployed} />
				</EmbedSection>

				<EmbedSection title="Deployment Errors">
					<EmbedPreview label="Deployment.crashed" embed={railwayEmbeds.crashed} />
					<EmbedPreview label="Deployment.oomKilled" embed={railwayEmbeds.oomKilled} />
					<EmbedPreview label="Deployment.failed" embed={railwayEmbeds.failed} />
				</EmbedSection>

				<EmbedSection title="Deployment Progress">
					<EmbedPreview label="Deployment.building" embed={railwayEmbeds.building} />
					<EmbedPreview label="Deployment.deploying" embed={railwayEmbeds.deploying} />
					<EmbedPreview label="Deployment.restarted" embed={railwayEmbeds.restarted} />
				</EmbedSection>

				<EmbedSection title="Deployment Pending">
					<EmbedPreview label="Deployment.queued" embed={railwayEmbeds.queued} />
					<EmbedPreview label="Deployment.needsApproval" embed={railwayEmbeds.needsApproval} />
				</EmbedSection>

				<EmbedSection title="Deployment Neutral">
					<EmbedPreview label="Deployment.removed" embed={railwayEmbeds.removed} />
					<EmbedPreview label="Deployment.slept" embed={railwayEmbeds.slept} />
				</EmbedSection>

				<EmbedSection title="Alerts">
					<EmbedPreview label="Alert.triggered" embed={railwayEmbeds.alertTriggered} />
					<EmbedPreview label="Alert.resolved" embed={railwayEmbeds.alertResolved} />
				</EmbedSection>
			</div>
		</div>
	)
}
