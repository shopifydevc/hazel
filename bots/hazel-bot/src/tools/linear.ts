import type { IntegrationToolFactory, ToolFactoryOptions, TokenResult } from "@hazel/bot-sdk"
import { LinearApiClient, makeLinearSdkClient } from "@hazel/integrations/linear"
import { Schema } from "effect"
import { tool } from "ai"
import type { Tool } from "ai"
import { effectSchemaToJsonSchema } from "./base.ts"

/**
 * Helper that wraps a Linear tool execute function with token fetching and error handling.
 * Eliminates the repeated getToken → check → try/catch pattern across all Linear tools.
 */
const withLinearAuth = <T>(
	options: ToolFactoryOptions,
	fn: (accessToken: string, runPromise: ToolFactoryOptions["runPromise"]) => Promise<T>,
) => {
	return async (): Promise<({ ok: true } & T) | { ok: false; error: string }> => {
		const token = await options.getAccessToken("linear")
		if (!token.ok) return { ok: false, error: token.error }

		try {
			const result = await fn(token.accessToken, options.runPromise)
			return { ok: true, ...result } as { ok: true } & T
		} catch (e) {
			return { ok: false, error: String(e) }
		}
	}
}

/**
 * Same as withLinearAuth but accepts tool input parameters.
 */
const withLinearAuthArgs = <TArgs, T>(
	options: ToolFactoryOptions,
	fn: (args: TArgs, accessToken: string, runPromise: ToolFactoryOptions["runPromise"]) => Promise<T>,
) => {
	return async (args: TArgs): Promise<({ ok: true } & T) | { ok: false; error: string }> => {
		const token = await options.getAccessToken("linear")
		if (!token.ok) return { ok: false, error: token.error }

		try {
			const result = await fn(args, token.accessToken, options.runPromise)
			return { ok: true, ...result } as { ok: true } & T
		} catch (e) {
			return { ok: false, error: String(e) }
		}
	}
}

const makeLinearTools = (options: ToolFactoryOptions) => {
	return {
		linear_get_account_info: tool({
			description: "Get the connected Linear account info for the current organization",
			inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
			execute: withLinearAuth(options, async (accessToken, runPromise) => {
				const info = await runPromise(LinearApiClient.getAccountInfo(accessToken))
				return {
					externalAccountId: info.externalAccountId,
					externalAccountName: info.externalAccountName,
				}
			}),
		}),

		linear_get_default_team: tool({
			description: "Get the default Linear team for the connected Linear account",
			inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
			execute: withLinearAuth(options, async (accessToken, runPromise) => {
				const team = await runPromise(LinearApiClient.getDefaultTeam(accessToken))
				return { team }
			}),
		}),

		linear_create_issue: tool({
			description:
				"Create a Linear issue. Use this after confirming with the user what you will create.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					title: Schema.String.annotations({
						description: "Issue title (max ~80 chars recommended)",
					}),
					description: Schema.optional(
						Schema.String.annotations({ description: "Markdown description for the issue" }),
					),
					teamId: Schema.optional(
						Schema.String.annotations({
							description: "Optional team ID; if omitted, uses the user's default team",
						}),
					),
				}),
			),
			execute: withLinearAuthArgs(
				options,
				async (
					args: { title: string; description?: string; teamId?: string },
					accessToken,
					runPromise,
				) => {
					const issue = await runPromise(
						LinearApiClient.createIssue(accessToken, {
							title: args.title,
							description: args.description,
							teamId: args.teamId,
						}),
					)
					return { issue }
				},
			),
		}),

		linear_fetch_issue: tool({
			description: 'Fetch a Linear issue by key (e.g. "ENG-123")',
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					issueKey: Schema.String.annotations({ description: 'Issue key like "ENG-123"' }),
				}),
			),
			execute: withLinearAuthArgs(
				options,
				async (args: { issueKey: string }, accessToken, runPromise) => {
					const issue = await runPromise(LinearApiClient.fetchIssue(args.issueKey, accessToken))
					return { issue }
				},
			),
		}),

		linear_list_issues: tool({
			description:
				"List Linear issues with optional filters (team, state, assignee, priority). Returns paginated results.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					teamId: Schema.optional(Schema.String.annotations({ description: "Filter by team ID" })),
					stateType: Schema.optional(
						Schema.Literal(
							"triage",
							"backlog",
							"unstarted",
							"started",
							"completed",
							"canceled",
						).annotations({
							description: "Filter by state type",
						}),
					),
					assigneeId: Schema.optional(
						Schema.String.annotations({ description: "Filter by assignee ID" }),
					),
					priority: Schema.optional(
						Schema.Number.annotations({
							description: "Filter by priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)",
						}),
					),
					first: Schema.optional(
						Schema.Number.annotations({
							description: "Number of issues to return (default 25, max 50)",
						}),
					),
					after: Schema.optional(
						Schema.String.annotations({ description: "Pagination cursor for next page" }),
					),
				}),
			),
			execute: withLinearAuthArgs(
				options,
				async (
					args: {
						teamId?: string
						stateType?: "triage" | "backlog" | "unstarted" | "started" | "completed" | "canceled"
						assigneeId?: string
						priority?: number
						first?: number
						after?: string
					},
					accessToken,
					runPromise,
				) => {
					const sdkClient = makeLinearSdkClient(accessToken)
					return await runPromise(sdkClient.listIssues(args))
				},
			),
		}),

		linear_search_issues: tool({
			description:
				"Search Linear issues by text query. Searches across title, description, and comments.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					query: Schema.String.annotations({ description: "Search text to find issues" }),
					first: Schema.optional(
						Schema.Number.annotations({
							description: "Number of issues to return (default 25, max 50)",
						}),
					),
					after: Schema.optional(
						Schema.String.annotations({ description: "Pagination cursor for next page" }),
					),
					includeArchived: Schema.optional(
						Schema.Boolean.annotations({
							description: "Include archived issues in search (default false)",
						}),
					),
				}),
			),
			execute: withLinearAuthArgs(
				options,
				async (
					args: { query: string; first?: number; after?: string; includeArchived?: boolean },
					accessToken,
					runPromise,
				) => {
					const sdkClient = makeLinearSdkClient(accessToken)
					return await runPromise(
						sdkClient.searchIssues(args.query, {
							first: args.first,
							after: args.after,
							includeArchived: args.includeArchived,
						}),
					)
				},
			),
		}),

		linear_list_teams: tool({
			description: "List all teams in the connected Linear workspace",
			inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
			execute: withLinearAuth(options, async (accessToken, runPromise) => {
				const sdkClient = makeLinearSdkClient(accessToken)
				return await runPromise(sdkClient.listTeams())
			}),
		}),

		linear_get_workflow_states: tool({
			description:
				"Get available workflow states (statuses) from Linear. Optionally filter by team. Use this to find valid state IDs before updating issues.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					teamId: Schema.optional(
						Schema.String.annotations({ description: "Filter states by team ID" }),
					),
				}),
			),
			execute: withLinearAuthArgs(
				options,
				async (args: { teamId?: string }, accessToken, runPromise) => {
					const sdkClient = makeLinearSdkClient(accessToken)
					return await runPromise(sdkClient.getWorkflowStates(args.teamId))
				},
			),
		}),

		linear_update_issue: tool({
			description:
				"Update an existing Linear issue. Use this after confirming with the user what changes to make. First use linear_get_workflow_states to get valid state IDs if changing status.",
			inputSchema: effectSchemaToJsonSchema(
				Schema.Struct({
					issueId: Schema.String.annotations({
						description: 'Issue identifier (e.g., "ENG-123" or UUID)',
					}),
					title: Schema.optional(
						Schema.String.annotations({ description: "New title for the issue" }),
					),
					description: Schema.optional(
						Schema.String.annotations({ description: "New markdown description" }),
					),
					stateId: Schema.optional(
						Schema.String.annotations({
							description:
								"New state/status ID (get valid IDs from linear_get_workflow_states)",
						}),
					),
					assigneeId: Schema.optional(
						Schema.NullOr(Schema.String).annotations({
							description: "New assignee ID, or null to unassign",
						}),
					),
					priority: Schema.optional(
						Schema.Number.annotations({
							description: "New priority (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low)",
						}),
					),
				}),
			),
			execute: withLinearAuthArgs(
				options,
				async (
					args: {
						issueId: string
						title?: string
						description?: string
						stateId?: string
						assigneeId?: string | null
						priority?: number
					},
					accessToken,
					runPromise,
				) => {
					const sdkClient = makeLinearSdkClient(accessToken)
					const { issueId, ...updates } = args
					return await runPromise(sdkClient.updateIssue(issueId, updates))
				},
			),
		}),
	} as const
}

export const LinearToolFactory: IntegrationToolFactory<Record<string, Tool>> = {
	provider: "linear",
	makeTools: makeLinearTools,
}
