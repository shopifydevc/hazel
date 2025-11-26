import {
	HttpMiddleware,
	HttpRouter,
	HttpServer,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Database } from "@hazel/db"
import { Effect, Layer, Logger } from "effect"
import { type BotAuthenticationError, validateBotToken } from "./auth/bot-auth"
import { type AuthenticationError, validateSession } from "./auth/user-auth"
import { ProxyConfigLive, ProxyConfigService } from "./config"
import { type ElectricProxyError, prepareElectricUrl, proxyElectricRequest } from "./proxy/electric-client"
import { type BotTableAccessError, getBotWhereClauseForTable, validateBotTable } from "./tables/bot-tables"
import { getWhereClauseForTable, type TableAccessError, validateTable } from "./tables/user-tables"
import { applyWhereToElectricUrl } from "./tables/where-clause-builder"

// =============================================================================
// USER FLOW HANDLER
// =============================================================================

const handleUserRequest = Effect.gen(function* () {
	const httpRequest = yield* HttpServerRequest.HttpServerRequest
	const request = (httpRequest as unknown as { source: Request }).source

	// Authenticate user
	const user = yield* validateSession(request)

	// Extract and validate table parameter
	const url = new URL(request.url)
	const tableParam = url.searchParams.get("table")
	const tableValidation = validateTable(tableParam)

	if (!tableValidation.valid) {
		return HttpServerResponse.unsafeJson(
			{ error: tableValidation.error },
			{ status: tableParam ? 403 : 400 },
		)
	}

	// Prepare Electric URL
	const originUrl = yield* prepareElectricUrl(request.url)
	originUrl.searchParams.set("table", tableValidation.table!)

	const whereResult = yield* getWhereClauseForTable(tableValidation.table!, user)

	yield* Effect.annotateCurrentSpan("where", whereResult.whereClause)
	yield* Effect.annotateCurrentSpan("whereType", whereResult.params)
	applyWhereToElectricUrl(originUrl, whereResult)

	// Proxy request to Electric
	const response = yield* proxyElectricRequest(originUrl)

	// Stream response through using HttpServerResponse.raw
	return HttpServerResponse.raw(response)
}).pipe(
	// Error handling
	Effect.catchTag("AuthenticationError", (error: AuthenticationError) =>
		Effect.gen(function* () {
			yield* Effect.logInfo("Authentication failed", { error: error.message, detail: error.detail })
			return HttpServerResponse.unsafeJson(
				{
					error: error.message,
					detail: error.detail,
					timestamp: new Date().toISOString(),
					hint: "Check if session cookie is present and valid",
				},
				{ status: 401 },
			)
		}),
	),
	Effect.catchTag("TableAccessError", (error: TableAccessError) =>
		Effect.gen(function* () {
			yield* Effect.logError("Table access error", { error: error.message, table: error.table })
			return HttpServerResponse.unsafeJson(
				{ error: error.message, detail: error.detail, table: error.table },
				{ status: 500 },
			)
		}),
	),
	Effect.catchTag("ElectricProxyError", (error: ElectricProxyError) =>
		Effect.gen(function* () {
			yield* Effect.logError("Electric proxy error", { error: error.message })
			return HttpServerResponse.unsafeJson(
				{ error: error.message, detail: error.detail },
				{ status: 502 },
			)
		}),
	),
	Effect.catchAll((error) =>
		Effect.gen(function* () {
			yield* Effect.logError("Unexpected error in user flow", { error: String(error) })
			return HttpServerResponse.unsafeJson(
				{ error: "Internal server error", detail: String(error) },
				{ status: 500 },
			)
		}),
	),
)

// =============================================================================
// BOT FLOW HANDLER (No CORS - server-to-server calls)
// =============================================================================

const handleBotRequest = Effect.gen(function* () {
	const httpRequest = yield* HttpServerRequest.HttpServerRequest
	const request = (httpRequest as unknown as { source: Request }).source

	// Authenticate bot
	const bot = yield* validateBotToken(request)

	// Extract and validate table parameter
	const url = new URL(request.url)
	const tableParam = url.searchParams.get("table")
	const tableValidation = validateBotTable(tableParam)

	if (!tableValidation.valid) {
		return HttpServerResponse.unsafeJson(
			{ error: tableValidation.error },
			{ status: tableParam ? 403 : 400 },
		)
	}

	// Prepare Electric URL
	const originUrl = yield* prepareElectricUrl(request.url)
	originUrl.searchParams.set("table", tableValidation.table!)

	// Generate WHERE clause with type-safe Drizzle operators
	const whereResult = yield* getBotWhereClauseForTable(tableValidation.table!, bot)
	applyWhereToElectricUrl(originUrl, whereResult)

	// Proxy request to Electric
	const response = yield* proxyElectricRequest(originUrl)

	// Stream response through using HttpServerResponse.raw
	return HttpServerResponse.raw(response)
}).pipe(
	// Error handling
	Effect.catchTag("BotAuthenticationError", (error: BotAuthenticationError) =>
		Effect.gen(function* () {
			yield* Effect.logInfo("Bot authentication failed", {
				error: error.message,
				detail: error.detail,
			})
			return HttpServerResponse.unsafeJson(
				{
					error: error.message,
					detail: error.detail,
					timestamp: new Date().toISOString(),
					hint: "Check if Authorization header contains valid Bearer token",
				},
				{ status: 401 },
			)
		}),
	),
	Effect.catchTag("BotTableAccessError", (error: BotTableAccessError) =>
		Effect.gen(function* () {
			yield* Effect.logError("Bot table access error", { error: error.message, table: error.table })
			return HttpServerResponse.unsafeJson(
				{ error: error.message, detail: error.detail, table: error.table },
				{ status: 500 },
			)
		}),
	),
	Effect.catchTag("ElectricProxyError", (error: ElectricProxyError) =>
		Effect.gen(function* () {
			yield* Effect.logError("Electric proxy error (bot)", { error: error.message })
			return HttpServerResponse.unsafeJson(
				{ error: error.message, detail: error.detail },
				{ status: 502 },
			)
		}),
	),
	Effect.catchAll((error) =>
		Effect.gen(function* () {
			yield* Effect.logError("Unexpected error in bot flow", { error: String(error) })
			return HttpServerResponse.unsafeJson(
				{ error: "Internal server error", detail: String(error) },
				{ status: 500 },
			)
		}),
	),
)

// =============================================================================
// LAYERS
// =============================================================================

const DatabaseLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		yield* Effect.log("Connecting to database", { isDev: config.isDev })
		return Database.layer({
			url: config.databaseUrl,
			ssl: !config.isDev,
		})
	}),
)

const LoggerLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		return config.isDev ? Logger.pretty : Logger.structured
	}),
).pipe(Layer.provide(ProxyConfigLive))

const MainLive = DatabaseLive.pipe(Layer.provideMerge(ProxyConfigLive), Layer.provideMerge(LoggerLive))

// =============================================================================
// ROUTER
// =============================================================================

// Health routes (no auth, no CORS)
const healthRouter = HttpRouter.empty.pipe(HttpRouter.get("/health", HttpServerResponse.text("OK")))

// User routes (with CORS middleware for browser access)
const userRouter = HttpRouter.empty.pipe(HttpRouter.get("/v1/shape", handleUserRequest))

// Bot routes (no CORS - server-to-server only)
const botRouter = HttpRouter.empty.pipe(HttpRouter.get("/bot/v1/shape", handleBotRequest))

// Build CORS middleware for user routes
const makeCorsMiddleware = Effect.gen(function* () {
	const config = yield* ProxyConfigService
	return HttpMiddleware.cors({
		allowedOrigins: [config.allowedOrigin],
		allowedMethods: ["GET", "DELETE", "OPTIONS"],
		credentials: true,
	})
})

// Combined router with selective CORS
const makeRouter = Effect.gen(function* () {
	const corsMiddleware = yield* makeCorsMiddleware
	const userRouterWithCors = userRouter.pipe(HttpRouter.use(corsMiddleware))

	return HttpRouter.empty.pipe(
		HttpRouter.mount("/", healthRouter),
		HttpRouter.mount("/", userRouterWithCors),
		HttpRouter.mount("/", botRouter),
	)
})

// =============================================================================
// SERVER
// =============================================================================

const ServerLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		return BunHttpServer.layer({
			hostname: "::",
			port: config.port,
			idleTimeout: 120,
		})
	}),
)

const AppLive = Layer.unwrapEffect(
	Effect.gen(function* () {
		const config = yield* ProxyConfigService
		const router = yield* makeRouter

		yield* Effect.log("Starting Electric Proxy", {
			port: config.port,
			electricUrl: config.electricUrl,
			allowedOrigin: config.allowedOrigin,
			electricAuthConfigured: !!(config.electricSourceId && config.electricSourceSecret),
		})

		return router.pipe(
			HttpServer.serve(HttpMiddleware.logger),
			HttpServer.withLogAddress,
			Layer.provide(ServerLive),
		)
	}),
)

// =============================================================================
// MAIN
// =============================================================================

Layer.launch(AppLive.pipe(Layer.provide(MainLive))).pipe(BunRuntime.runMain)
