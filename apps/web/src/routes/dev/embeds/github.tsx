import {
	buildDeploymentEmbed,
	buildIssueEmbed,
	buildPullRequestEmbed,
	buildPushEmbed,
	buildReleaseEmbed,
	buildStarEmbed,
	buildWorkflowRunEmbed,
	testPayloads,
} from "@hazel/integrations/github/browser"
import { createFileRoute, Link } from "@tanstack/react-router"
import { MessageEmbeds } from "~/components/chat/message-embeds"

export const Route = createFileRoute("/dev/embeds/github")({
	component: RouteComponent,
})

// Generate embeds from real builders using test fixtures
// This ensures demos stay in sync with production embed output
const mockEmbeds = {
	// Star events
	star_created: buildStarEmbed(testPayloads.star_created),
	star_deleted: buildStarEmbed(testPayloads.star_deleted),

	// Pull request events
	pr_opened: buildPullRequestEmbed(testPayloads.pr_opened),
	pr_merged: buildPullRequestEmbed(testPayloads.pr_merged),
	pr_closed: buildPullRequestEmbed(testPayloads.pr_closed),
	pr_draft: buildPullRequestEmbed(testPayloads.pr_draft),

	// Push events
	push_single: buildPushEmbed(testPayloads.push_single),
	push_multiple: buildPushEmbed(testPayloads.push_multiple),

	// Issue events
	issue_opened: buildIssueEmbed(testPayloads.issue_opened),
	issue_closed: buildIssueEmbed(testPayloads.issue_closed),

	// Release events
	release_stable: buildReleaseEmbed(testPayloads.release_published),
	release_prerelease: buildReleaseEmbed(testPayloads.release_prerelease),

	// Deployment events
	deployment_success: buildDeploymentEmbed(testPayloads.deployment_success),
	deployment_failure: buildDeploymentEmbed(testPayloads.deployment_failure),
	deployment_pending: buildDeploymentEmbed(testPayloads.deployment_pending),

	// Workflow events
	workflow_success: buildWorkflowRunEmbed(testPayloads.workflow_success),
	workflow_failure: buildWorkflowRunEmbed(testPayloads.workflow_failure),
	workflow_cancelled: buildWorkflowRunEmbed(testPayloads.workflow_cancelled),
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
					<div className="flex items-center gap-2">
						<Link to="/dev/embeds" className="text-muted-fg hover:text-fg">
							Embeds
						</Link>
						<span className="text-muted-fg">/</span>
						<span className="text-fg">GitHub</span>
					</div>
					<h1 className="font-bold text-2xl text-fg">GitHub Embed Cards</h1>
					<p className="text-muted-fg">
						Preview of all GitHub webhook embed card variants. Generated from
						real embed builders to ensure demos stay in sync with production.
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
			</div>
		</div>
	)
}
