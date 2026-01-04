import { createFileRoute } from "@tanstack/react-router"
import { MessageEmbeds } from "~/components/chat/message-embeds"

export const Route = createFileRoute("/dev/embeds")({
	component: RouteComponent,
})

// Mock GitHub user
const mockUser = {
	login: "octocat",
	avatar_url: "https://avatars.githubusercontent.com/u/583231?v=4",
	html_url: "https://github.com/octocat",
}

// Mock repository with star count
const mockRepo = {
	id: 1,
	name: "hello-world",
	full_name: "octocat/hello-world",
	html_url: "https://github.com/octocat/hello-world",
	stargazers_count: 12345,
	forks_count: 2345,
	language: "TypeScript",
}

// GitHub brand colors
const COLORS = {
	push: 0x2ea44f,
	pr_opened: 0x238636,
	pr_closed: 0xda3633,
	pr_merged: 0x8957e5,
	pr_draft: 0x6e7681,
	issue_opened: 0x238636,
	issue_closed: 0xda3633,
	release: 0x1f6feb,
	deployment_success: 0x238636,
	deployment_failure: 0xda3633,
	deployment_pending: 0xdbab09,
	workflow_success: 0x238636,
	workflow_failure: 0xda3633,
	workflow_cancelled: 0x6e7681,
	star: 0xf1e05a,
}

// Mock embeds for all GitHub event types
const mockEmbeds = {
	// Star events
	star_created: {
		title: "octocat/hello-world",
		description:
			"**octocat** starred this repository\nNow at **12.3k** stars",
		url: "https://github.com/octocat/hello-world",
		color: COLORS.star,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "GitHub",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Total Stars", value: "12.3k", inline: true },
			{ name: "Forks", value: "2.3k", inline: true },
			{ name: "Language", value: "TypeScript", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Starred", color: COLORS.star },
	},

	star_deleted: {
		title: "octocat/hello-world",
		description: "**octocat** unstarred this repository",
		url: "https://github.com/octocat/hello-world",
		color: COLORS.star,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "GitHub",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		timestamp: new Date().toISOString(),
		badge: { text: "Unstarred", color: COLORS.star },
	},

	// PR events
	pr_opened: {
		title: "#42 Add dark mode support",
		description:
			"This PR adds dark mode support to the application using CSS custom properties and a theme toggle component.",
		url: "https://github.com/octocat/hello-world/pull/42",
		color: COLORS.pr_opened,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Diff", value: "{green:+234} {red:-45} (279 lines)", inline: true },
			{ name: "Labels", value: "`enhancement` `ui`", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Opened", color: COLORS.pr_opened },
	},

	pr_merged: {
		title: "#41 Implement user authentication",
		description:
			"Added OAuth2 authentication with GitHub and Google providers. Includes session management and protected routes.",
		url: "https://github.com/octocat/hello-world/pull/41",
		color: COLORS.pr_merged,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Diff", value: "{green:+1,234} {red:-89} (1,323 lines)", inline: true },
			{
				name: "Labels",
				value: "`feature` `security` `breaking` +2",
				inline: true,
			},
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Merged", color: COLORS.pr_merged },
	},

	pr_closed: {
		title: "#40 Refactor database queries",
		description:
			"Closed without merging. This approach was superseded by PR #41 which uses a different strategy.",
		url: "https://github.com/octocat/hello-world/pull/40",
		color: COLORS.pr_closed,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Diff", value: "{green:+567} {red:-123} (690 lines)", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Closed", color: COLORS.pr_closed },
	},

	pr_draft: {
		title: "#43 [WIP] Add GraphQL API",
		description:
			"Work in progress - Adding a GraphQL API layer. Not ready for review yet.",
		url: "https://github.com/octocat/hello-world/pull/43",
		color: COLORS.pr_draft,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Diff", value: "{green:+89} {red:-12} (101 lines)", inline: true },
			{ name: "Labels", value: "`wip`", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Draft", color: COLORS.pr_draft },
	},

	// Push events
	push_single: {
		title: "octocat/hello-world",
		description: "**1** commit pushed to `main`",
		url: "https://github.com/octocat/hello-world/compare/abc123...def456",
		color: COLORS.push,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "GitHub",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [{ name: "`abc1234`", value: "Fix typo in README", inline: false }],
		timestamp: new Date().toISOString(),
		badge: { text: "Push", color: COLORS.push },
	},

	push_multiple: {
		title: "octocat/hello-world",
		description: "**5** commits pushed to `feature/dark-mode`",
		url: "https://github.com/octocat/hello-world/compare/abc123...def456",
		color: COLORS.push,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "GitHub",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "`abc1234`", value: "Add theme toggle component", inline: false },
			{ name: "`def5678`", value: "Update CSS variables for dark mode", inline: false },
			{ name: "`ghi9012`", value: "Fix contrast issues in dark mode", inline: false },
			{ name: "`jkl3456`", value: "Add localStorage persistence", inline: false },
			{ name: "`mno7890`", value: "Update documentation", inline: false },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Push", color: COLORS.push },
	},

	// Issue events
	issue_opened: {
		title: "#123 Button click not working on mobile",
		description:
			"The submit button on the contact form doesn't respond to touch events on iOS Safari. Steps to reproduce included.",
		url: "https://github.com/octocat/hello-world/issues/123",
		color: COLORS.issue_opened,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [{ name: "Labels", value: "`bug` `mobile` `high-priority`", inline: true }],
		timestamp: new Date().toISOString(),
		badge: { text: "Opened", color: COLORS.issue_opened },
	},

	issue_closed: {
		title: "#122 Add support for keyboard shortcuts",
		description: "Resolved in PR #41. All keyboard shortcuts are now working.",
		url: "https://github.com/octocat/hello-world/issues/122",
		color: COLORS.issue_closed,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [{ name: "Labels", value: "`enhancement` `accessibility`", inline: true }],
		timestamp: new Date().toISOString(),
		badge: { text: "Closed", color: COLORS.issue_closed },
	},

	// Release events
	release_stable: {
		title: "v2.0.0 - Major Update",
		description:
			"This release includes dark mode, OAuth authentication, and improved performance. See the changelog for full details.",
		url: "https://github.com/octocat/hello-world/releases/tag/v2.0.0",
		color: COLORS.release,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [{ name: "Tag", value: "v2.0.0", inline: true }],
		timestamp: new Date().toISOString(),
		badge: { text: "Release", color: COLORS.release },
	},

	release_prerelease: {
		title: "v2.1.0-beta.1 - Beta Release",
		description:
			"Pre-release with experimental features. Not recommended for production use.",
		url: "https://github.com/octocat/hello-world/releases/tag/v2.1.0-beta.1",
		color: COLORS.release,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Tag", value: "v2.1.0-beta.1", inline: true },
			{ name: "Pre-release", value: "Yes", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Release", color: COLORS.release },
	},

	// Deployment events
	deployment_success: {
		title: "Deployment success",
		description: "Successfully deployed to production environment.",
		url: "https://hello-world.vercel.app",
		color: COLORS.deployment_success,
		author: {
			name: "github-actions",
			url: "https://github.com/features/actions",
			iconUrl: "https://avatars.githubusercontent.com/u/44036562?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [{ name: "Environment", value: "production", inline: true }],
		timestamp: new Date().toISOString(),
		badge: { text: "Deployment success", color: COLORS.deployment_success },
	},

	deployment_failure: {
		title: "Deployment failure",
		description: "Deployment failed: Build step exited with error code 1.",
		url: "https://github.com/octocat/hello-world/actions/runs/12345",
		color: COLORS.deployment_failure,
		author: {
			name: "github-actions",
			url: "https://github.com/features/actions",
			iconUrl: "https://avatars.githubusercontent.com/u/44036562?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [{ name: "Environment", value: "staging", inline: true }],
		timestamp: new Date().toISOString(),
		badge: { text: "Deployment failure", color: COLORS.deployment_failure },
	},

	deployment_pending: {
		title: "Deployment pending",
		description: "Waiting for approval to deploy to production.",
		url: "https://github.com/octocat/hello-world/actions/runs/12346",
		color: COLORS.deployment_pending,
		author: {
			name: "github-actions",
			url: "https://github.com/features/actions",
			iconUrl: "https://avatars.githubusercontent.com/u/44036562?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [{ name: "Environment", value: "production", inline: true }],
		timestamp: new Date().toISOString(),
		badge: { text: "Deployment pending", color: COLORS.deployment_pending },
	},

	// Workflow events
	workflow_success: {
		title: "CI/CD Pipeline",
		description: "Workflow completed successfully",
		url: "https://github.com/octocat/hello-world/actions/runs/12347",
		color: COLORS.workflow_success,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Branch", value: "`main`", inline: true },
			{ name: "Duration", value: "2m 34s", inline: true },
			{ name: "Run", value: "#456", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Passed", color: COLORS.workflow_success },
	},

	workflow_failure: {
		title: "CI/CD Pipeline",
		description: "Workflow failed",
		url: "https://github.com/octocat/hello-world/actions/runs/12348",
		color: COLORS.workflow_failure,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Branch", value: "`feature/new-api`", inline: true },
			{ name: "Duration", value: "1m 12s", inline: true },
			{ name: "Run", value: "#457", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Failed", color: COLORS.workflow_failure },
	},

	workflow_cancelled: {
		title: "CI/CD Pipeline",
		description: "Workflow was cancelled",
		url: "https://github.com/octocat/hello-world/actions/runs/12349",
		color: COLORS.workflow_cancelled,
		author: {
			name: "octocat",
			url: "https://github.com/octocat",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "octocat/hello-world",
			iconUrl: "https://cdn.brandfetch.io/github.com/w/64/h/64/theme/dark/icon",
		},
		fields: [
			{ name: "Branch", value: "`develop`", inline: true },
			{ name: "Duration", value: "0m 45s", inline: true },
			{ name: "Run", value: "#458", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Cancelled", color: COLORS.workflow_cancelled },
	},

	// Colored text demo
	color_demo: {
		title: "Colored Text Demo",
		description:
			"Syntax: {red:red} {green:green} {blue:blue} {yellow:yellow} {purple:purple} {orange:orange} {gray:gray}",
		url: "https://example.com",
		color: 0x5865f2,
		author: {
			name: "Demo",
			iconUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
		},
		footer: {
			text: "Embed Markdown",
		},
		fields: [
			{ name: "Semantic", value: "{success:success} {error:error} {warning:warning} {info:info}", inline: false },
			{ name: "Diff Stats", value: "{green:+1,234} {red:-567} (1,801 lines)", inline: true },
			{ name: "Mixed", value: "**Bold** and {green:colored} and `code`", inline: true },
		],
		timestamp: new Date().toISOString(),
		badge: { text: "Demo", color: 0x5865f2 },
	},
}

function EmbedSection({
	title,
	children,
}: { title: string; children: React.ReactNode }) {
	return (
		<div className="space-y-4">
			<h2 className="font-semibold text-fg text-lg">{title}</h2>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
		</div>
	)
}

function EmbedPreview({
	label,
	embed,
}: { label: string; embed: (typeof mockEmbeds)[keyof typeof mockEmbeds] }) {
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
			<div className="mx-auto max-w-7xl space-y-12">
				<div className="space-y-2">
					<h1 className="font-bold text-2xl text-fg">
						GitHub Embed Cards Preview
					</h1>
					<p className="text-muted-fg">
						Development preview of all GitHub webhook embed card variants.
					</p>
				</div>

				<EmbedSection title="Star Events">
					<EmbedPreview label="star:created" embed={mockEmbeds.star_created} />
					<EmbedPreview label="star:deleted" embed={mockEmbeds.star_deleted} />
				</EmbedSection>

				<EmbedSection title="Pull Request Events">
					<EmbedPreview label="pr:opened" embed={mockEmbeds.pr_opened} />
					<EmbedPreview label="pr:merged" embed={mockEmbeds.pr_merged} />
					<EmbedPreview label="pr:closed" embed={mockEmbeds.pr_closed} />
					<EmbedPreview label="pr:draft" embed={mockEmbeds.pr_draft} />
				</EmbedSection>

				<EmbedSection title="Push Events">
					<EmbedPreview label="push:single" embed={mockEmbeds.push_single} />
					<EmbedPreview label="push:multiple" embed={mockEmbeds.push_multiple} />
				</EmbedSection>

				<EmbedSection title="Issue Events">
					<EmbedPreview label="issue:opened" embed={mockEmbeds.issue_opened} />
					<EmbedPreview label="issue:closed" embed={mockEmbeds.issue_closed} />
				</EmbedSection>

				<EmbedSection title="Release Events">
					<EmbedPreview label="release:stable" embed={mockEmbeds.release_stable} />
					<EmbedPreview label="release:prerelease" embed={mockEmbeds.release_prerelease} />
				</EmbedSection>

				<EmbedSection title="Deployment Events">
					<EmbedPreview label="deployment:success" embed={mockEmbeds.deployment_success} />
					<EmbedPreview label="deployment:failure" embed={mockEmbeds.deployment_failure} />
					<EmbedPreview label="deployment:pending" embed={mockEmbeds.deployment_pending} />
				</EmbedSection>

				<EmbedSection title="Workflow Events">
					<EmbedPreview label="workflow:success" embed={mockEmbeds.workflow_success} />
					<EmbedPreview label="workflow:failure" embed={mockEmbeds.workflow_failure} />
					<EmbedPreview label="workflow:cancelled" embed={mockEmbeds.workflow_cancelled} />
				</EmbedSection>

				<EmbedSection title="Colored Text Demo">
					<EmbedPreview label="color:demo" embed={mockEmbeds.color_demo} />
				</EmbedSection>
			</div>
		</div>
	)
}
