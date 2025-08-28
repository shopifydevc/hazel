import { OtlpTracer } from "@effect/opentelemetry"
import {
	FetchHttpClient,
	HttpLayerRouter,
	HttpMiddleware,
	HttpServer,
	HttpServerResponse,
} from "@effect/platform"
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { RpcSerialization, RpcServer } from "@effect/rpc"
import { Layer } from "effect"

const HealthRouter = HttpLayerRouter.use((router) =>
	router.add("GET", "/health", HttpServerResponse.text("OK")),
)

const AllRoutes = Layer.mergeAll(HealthRouter).pipe(
	Layer.provide(
		HttpLayerRouter.cors({
			allowedOrigins: ["*"],
			allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
			allowedHeaders: ["Content-Type", "Authorization", "B3", "traceparent"],
			credentials: true,
		}),
	),
)

const TracerLive = OtlpTracer.layer({
	url: "http://localhost:4318/v1/traces",
	resource: {
		serviceName: "effect-is-awesome",
	},
}).pipe(Layer.provide(FetchHttpClient.layer))

const HttpLive = HttpLayerRouter.serve(AllRoutes).pipe(
	HttpMiddleware.withTracerDisabledWhen(
		(request) => request.url === "/health" || request.method === "OPTIONS",
	),
	Layer.provide(BunHttpServer.layer({ port: 3003 })),
	Layer.provide(TracerLive),
)

BunRuntime.runMain(Layer.launch(HttpLive))
