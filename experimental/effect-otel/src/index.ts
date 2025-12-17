/**
 * @hazel/effect-otel - Effect OpenTelemetry extensions with sampling support
 *
 * This package provides a sampled OTLP tracer implementation for Effect-TS.
 * The `@effect/opentelemetry` package doesn't support trace sampling - all
 * traces are exported. This package adds head-based probabilistic sampling.
 *
 * @example
 * ```typescript
 * import * as Otlp from "@hazel/effect-otel/Otlp"
 * import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
 * import * as Layer from "effect/Layer"
 *
 * const TracingLive = Otlp.layer({
 *   baseUrl: "https://ingest.eu.signoz.cloud",
 *   sampleRate: 0.1, // 10% of traces
 *   resource: {
 *     serviceName: "my-service",
 *     serviceVersion: "1.0.0",
 *   },
 *   headers: {
 *     "signoz-ingestion-key": "your-key",
 *   },
 * }).pipe(Layer.provide(FetchHttpClient.layer))
 * ```
 */

export * as Otlp from "./Otlp.js"
export * as SampledOtlpTracer from "./SampledOtlpTracer.js"
export * as OtlpResource from "./OtlpResource.js"
