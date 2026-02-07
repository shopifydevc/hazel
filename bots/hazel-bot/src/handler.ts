import {
	buildIntegrationTools,
	generateIntegrationInstructions,
	type AIContentChunk,
	type HazelBotClient,
	type TokenResult,
} from "@hazel/bot-sdk"
import type { ChannelId, OrganizationId } from "@hazel/schema"
import { Cause, Config, Effect, Exit, Redacted, Runtime, Stream } from "effect"
import { ToolLoopAgent } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"

import { baseTools } from "./tools/base.ts"
import { LinearToolFactory } from "./tools/linear.ts"
import { mapVercelPartToChunk, type VercelStreamState } from "./stream.ts"
import { INTEGRATION_INSTRUCTIONS, buildSystemPrompt } from "./prompt.ts"

/**
 * Shared AI pipeline used by both /ask command and @mention handler.
 * Creates a streaming AI session in the given channel and runs the ToolLoopAgent.
 */
export const handleAIRequest = (params: {
	bot: HazelBotClient
	message: string
	channelId: ChannelId
	orgId: OrganizationId
	history?: Array<{ role: "user" | "assistant"; content: string }>
}) =>
	Effect.gen(function* () {
		const { bot, message, channelId, orgId } = params

		const runtime = yield* Effect.runtime()
		const runPromise = Runtime.runPromise(runtime) as <A, E, R>(
			effect: Effect.Effect<A, E, R>,
		) => Promise<A>

		// Get enabled integrations for this org (cached)
		const enabledIntegrations = yield* bot.integration.getEnabled(orgId)

		yield* Effect.log(`Enabled integrations for org ${orgId}:`, {
			integrations: Array.from(enabledIntegrations),
		})

		// Token cache per provider
		const tokenCache = new Map<string, Promise<TokenResult>>()

		const getAccessToken = (
			provider: "linear" | "github" | "figma" | "notion" | "discord",
		): Promise<TokenResult> => {
			const cached = tokenCache.get(provider)
			if (cached) return cached

			const promise = (async () => {
				try {
					const { accessToken } = await runPromise(bot.integration.getToken(orgId, provider))
					return { ok: true, accessToken } as const
				} catch (e: any) {
					const tag = e && typeof e === "object" && "_tag" in e ? String(e._tag) : null
					if (tag === "IntegrationNotConnectedError") {
						runPromise(bot.integration.invalidateCache(orgId))
						return {
							ok: false,
							error: `${provider} is not connected for this organization. Please connect ${provider} and try again.`,
						} as const
					}
					if (tag === "IntegrationNotAllowedError") {
						return {
							ok: false,
							error: `${provider} access is not allowed for this bot. Please allow the ${provider} integration and try again.`,
						} as const
					}
					return {
						ok: false,
						error: `Failed to get ${provider} token: ${tag ?? String(e)}`,
					} as const
				}
			})()

			tokenCache.set(provider, promise)
			return promise
		}

		// Build integration tools based on enabled integrations
		const integrationTools = buildIntegrationTools(enabledIntegrations, [LinearToolFactory], {
			runPromise,
			getAccessToken,
		})

		// Generate dynamic instructions based on enabled integrations
		const integrationInstructions = generateIntegrationInstructions(
			enabledIntegrations,
			INTEGRATION_INSTRUCTIONS,
		)

		const apiKey = yield* Config.redacted("OPENROUTER_API_KEY")
		const modelName = yield* Config.string("AI_MODEL").pipe(Config.withDefault("moonshotai/kimi-k2.5"))

		const openrouter = createOpenRouter({
			apiKey: Redacted.value(apiKey),
		})

		// Use acquireUseRelease for guaranteed cleanup of the streaming session.
		// This ensures session.fail() is called even if the handler is interrupted
		// during agent setup, stream processing, or process shutdown.
		yield* Effect.acquireUseRelease(
			// Acquire: create the streaming session
			bot.ai.stream(channelId, {
				model: modelName,
				showThinking: true,
				showToolCalls: true,
				loading: {
					text: "Thinking...",
					icon: "sparkle",
					throbbing: true,
				},
			}),
			// Use: run the agent and complete on success
			(session) =>
				Effect.gen(function* () {
					yield* Effect.log(`Created streaming message ${session.messageId}`)

					const systemInstructions = buildSystemPrompt(integrationInstructions)

					const codebaseAgent = new ToolLoopAgent({
						model: openrouter(modelName),
						instructions: systemInstructions,
						tools: { ...baseTools, ...integrationTools },
						toolChoice: "auto",
					})

					const result = yield* Effect.promise(() =>
						params.history
							? codebaseAgent.stream({
									messages: params.history.map((m) => ({
										role: m.role,
										content: m.content,
									})),
								})
							: codebaseAgent.stream({
									prompt: message,
								}),
					)

					const streamState: VercelStreamState = { hasActiveReasoning: false }

					yield* Stream.fromAsyncIterable(result.fullStream, (e) => new Error(String(e))).pipe(
						Stream.map((part) => mapVercelPartToChunk(part, streamState)),
						Stream.filter((chunk): chunk is AIContentChunk => chunk !== null),
						Stream.runForEach((chunk) => session.processChunk(chunk)),
					)

					yield* session.complete()
					yield* Effect.log(`Agent response complete: ${session.messageId}`)
				}),
			// Release: on failure/interrupt, persist the error state
			(session, exit) =>
				Exit.isSuccess(exit)
					? Effect.void
					: Effect.gen(function* () {
							const cause = exit.cause
							yield* Effect.logError("Agent streaming failed", { error: cause })

							const userMessage: string = Cause.match(cause, {
								onEmpty: "Request was cancelled.",
								onFail: (error) => `An error occurred: ${String(error)}`,
								onDie: () => "An unexpected error occurred.",
								onInterrupt: () => "Request was cancelled.",
								onSequential: (left: string) => left,
								onParallel: (left: string) => left,
							})

							yield* session.fail(userMessage).pipe(Effect.ignore)
						}),
		)
	})
