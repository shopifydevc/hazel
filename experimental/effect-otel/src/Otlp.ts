/**
 * Combined OTLP layer with sampling support
 *
 * This module provides a combined layer for OTLP tracing (with sampling),
 * logging, and metrics export. Only trace sampling is applied - logs and
 * metrics are always exported at 100%.
 */
import type * as Headers from "@effect/platform/Headers"
import type * as HttpClient from "@effect/platform/HttpClient"
import * as OtlpLogger from "@effect/opentelemetry/OtlpLogger"
import * as OtlpMetrics from "@effect/opentelemetry/OtlpMetrics"
import type * as Duration from "effect/Duration"
import * as Layer from "effect/Layer"
import * as SampledOtlpTracer from "./SampledOtlpTracer.js"

/**
 * Create a combined OTLP layer with sampling support for traces
 *
 * @param options Configuration options
 * @param options.baseUrl Base URL for OTLP endpoints (e.g., "https://ingest.eu.signoz.cloud")
 * @param options.sampleRate Trace sampling rate (0.0 to 1.0). Default: 1.0 (all traces)
 * @param options.resource Service resource configuration
 * @param options.headers HTTP headers for OTLP requests (e.g., auth tokens)
 * @param options.exportInterval How often to export batched data. Default: 5 seconds
 * @param options.maxBatchSize Maximum batch size before forced export. Default: 1000
 * @param options.shutdownTimeout Timeout for graceful shutdown. Default: 3 seconds
 */
export const layer = (options: {
	readonly baseUrl: string
	readonly sampleRate?: number | undefined
	readonly resource?: {
		readonly serviceName?: string | undefined
		readonly serviceVersion?: string | undefined
		readonly attributes?: Record<string, unknown>
	} | undefined
	readonly headers?: Headers.Input | undefined
	readonly exportInterval?: Duration.DurationInput | undefined
	readonly maxBatchSize?: number | undefined
	readonly shutdownTimeout?: Duration.DurationInput | undefined
}): Layer.Layer<never, never, HttpClient.HttpClient> => {
	const url = (path: string) => `${options.baseUrl}${path}`
	const sampleRate = options.sampleRate ?? 1.0

	return Layer.mergeAll(
		// Traces with sampling
		SampledOtlpTracer.layer({
			url: url("/v1/traces"),
			sampleRate,
			resource: options.resource,
			headers: options.headers,
			exportInterval: options.exportInterval,
			maxBatchSize: options.maxBatchSize,
			shutdownTimeout: options.shutdownTimeout,
		}),
		// Logs - always 100% (no sampling)
		OtlpLogger.layer({
			url: url("/v1/logs"),
			resource: options.resource,
			headers: options.headers,
		}),
		// Metrics - always 100% (no sampling)
		OtlpMetrics.layer({
			url: url("/v1/metrics"),
			resource: options.resource,
			headers: options.headers,
		}),
	)
}
