/**
 * @module Tauri update atoms
 * @platform desktop
 * @description Effect Atom-based state management for Tauri app updates
 */

import { Atom } from "@effect-atom/atom-react"
import { Data, Duration, Effect, Schedule, Stream } from "effect"
import { runtime } from "~/lib/services/common/runtime"

type UpdaterApi = typeof import("@tauri-apps/plugin-updater")
type ProcessApi = typeof import("@tauri-apps/plugin-process")
type TauriUpdate = Awaited<ReturnType<UpdaterApi["check"]>>
type DownloadCallback = NonNullable<Parameters<NonNullable<TauriUpdate>["download"]>[0]>
type DownloadEvent = Parameters<DownloadCallback>[0]

/**
 * Tagged error classes for update operations
 */
export class UpdateCheckError extends Data.TaggedError("UpdateCheckError")<{
	message: string
}> {}

export class UpdateDownloadError extends Data.TaggedError("UpdateDownloadError")<{
	message: string
}> {}

export class UpdateInstallError extends Data.TaggedError("UpdateInstallError")<{
	message: string
}> {}

export class UpdateRelaunchError extends Data.TaggedError("UpdateRelaunchError")<{
	message: string
}> {}

const updater: UpdaterApi | undefined = (window as any).__TAURI__?.updater
const process: ProcessApi | undefined = (window as any).__TAURI__?.process

/**
 * Update check state
 */
export type TauriUpdateState =
	| { _tag: "idle" }
	| { _tag: "checking" }
	| { _tag: "available"; version: string; body: string | null; update: NonNullable<TauriUpdate> }
	| { _tag: "not-available"; lastCheckedAt: Date }
	| { _tag: "error"; message: string }

/**
 * Download/install progress state
 */
export type TauriDownloadState =
	| { _tag: "idle" }
	| { _tag: "downloading"; downloadedBytes: number; totalBytes: number | undefined }
	| { _tag: "installing" }
	| { _tag: "restarting" }
	| { _tag: "error"; message: string }

/**
 * Writable atom holding the update check result
 */
export const tauriUpdateStateAtom = Atom.make<TauriUpdateState>({ _tag: "idle" }).pipe(Atom.keepAlive)

/**
 * Writable atom holding the download/install progress
 */
export const tauriDownloadStateAtom = Atom.make<TauriDownloadState>({ _tag: "idle" }).pipe(Atom.keepAlive)

/**
 * Check for updates interval (6 hours)
 */
const UPDATE_CHECK_INTERVAL = Duration.hours(6)

/**
 * Creates a stream that runs the given effect on a schedule.
 * Exported for testing purposes.
 */
export const createScheduledStream = <S, A, E, R>(
	schedule: Schedule.Schedule<S>,
	effect: Effect.Effect<A, E, R>,
) =>
	Stream.fromSchedule(schedule).pipe(
		Stream.tap(() => effect),
		Stream.runDrain,
	)

/**
 * Side-effect atom that performs periodic update checks.
 * Runs immediately on mount then every 6 hours.
 * Uses runtime.runFork() to run the stream as a fiber.
 */
export const tauriUpdateCheckAtom = Atom.make((get) => {
	// Skip if not in Tauri environment
	if (!updater || !process) return null

	const checkForUpdates = Effect.gen(function* () {
		// Get current state to prevent duplicate checks
		const currentState = get(tauriUpdateStateAtom)
		if (currentState._tag === "checking") return

		get.set(tauriUpdateStateAtom, { _tag: "checking" })

		try {
			const update = yield* Effect.promise(() => updater!.check())

			if (update) {
				get.set(tauriUpdateStateAtom, {
					_tag: "available",
					version: update.version,
					body: update.body ?? null,
					update,
				})
			} else {
				get.set(tauriUpdateStateAtom, { _tag: "not-available", lastCheckedAt: new Date() })
			}
		} catch (error) {
			console.error("Update check failed:", error)
			get.set(tauriUpdateStateAtom, {
				_tag: "error",
				message: error instanceof Error ? error.message : "Unknown error",
			})
		}
	})

	// Schedule: run immediately at t=0 (once), then every 6 hours (spaced)
	// Note: Schedule.spaced alone would delay the first check by 6 hours
	const schedule = Schedule.union(Schedule.once, Schedule.spaced(UPDATE_CHECK_INTERVAL))

	const fiber = runtime.runFork(createScheduledStream(schedule, checkForUpdates))

	get.addFinalizer(() => {
		fiber.unsafeInterruptAsFork(fiber.id())
	})

	return null
}).pipe(Atom.keepAlive)

/**
 * Creates an Effect that downloads and installs an update.
 * The component should pass the setDownloadState function to update progress.
 *
 * Uses separate download() and install() phases for better progress tracking
 * and error handling.
 */
export const createDownloadEffect = (
	update: NonNullable<TauriUpdate>,
	setDownloadState: (state: TauriDownloadState) => void,
) =>
	Effect.gen(function* () {
		if (!process) return

		let downloadedBytes = 0
		let totalBytes: number | undefined

		// Phase 1: Download with progress tracking
		yield* Effect.tryPromise({
			try: () =>
				update.download((event: DownloadEvent) => {
					console.log("[update] Download event:", event.event)
					switch (event.event) {
						case "Started":
							console.log("[update] Content length:", event.data.contentLength)
							totalBytes = event.data.contentLength ?? undefined
							setDownloadState({
								_tag: "downloading",
								downloadedBytes: 0,
								totalBytes,
							})
							break
						case "Progress":
							downloadedBytes += event.data.chunkLength
							setDownloadState({
								_tag: "downloading",
								downloadedBytes,
								totalBytes,
							})
							break
						case "Finished":
							console.log("[update] Download finished")
							break
					}
				}),
			catch: (error) =>
				new UpdateDownloadError({
					message: error instanceof Error ? error.message : "Download failed",
				}),
		})

		// Phase 2: Install
		setDownloadState({ _tag: "installing" })
		yield* Effect.tryPromise({
			try: () => update.install(),
			catch: (error) =>
				new UpdateInstallError({
					message: error instanceof Error ? error.message : "Installation failed",
				}),
		})

		// Phase 3: Restart with delay to ensure installation completes
		setDownloadState({ _tag: "restarting" })
		yield* Effect.sleep(Duration.millis(500))

		yield* Effect.tryPromise({
			try: () => process!.relaunch(),
			catch: () =>
				new UpdateRelaunchError({
					message: "Update installed successfully. Please restart the app manually.",
				}),
		})
	}).pipe(
		Effect.catchTags({
			UpdateDownloadError: (error) =>
				Effect.sync(() => {
					console.error("[update] Download failed:", error.message)
					setDownloadState({ _tag: "error", message: error.message })
				}),
			UpdateInstallError: (error) =>
				Effect.sync(() => {
					console.error("[update] Install failed:", error.message)
					setDownloadState({ _tag: "error", message: error.message })
				}),
			UpdateRelaunchError: (error) =>
				Effect.sync(() => {
					console.error("[update] Relaunch failed:", error.message)
					setDownloadState({ _tag: "error", message: error.message })
				}),
		}),
	)

/**
 * Creates an Effect that manually checks for updates.
 * Used by the Desktop settings page to allow users to trigger an update check.
 */
export const checkForUpdatesManually = (setUpdateState: (state: TauriUpdateState) => void) =>
	Effect.gen(function* () {
		if (!updater || !process) return

		setUpdateState({ _tag: "checking" })

		const update = yield* Effect.tryPromise({
			try: () => updater!.check(),
			catch: (error) =>
				new UpdateCheckError({
					message: error instanceof Error ? error.message : "Failed to check for updates",
				}),
		})

		if (update) {
			setUpdateState({
				_tag: "available",
				version: update.version,
				body: update.body ?? null,
				update,
			})
		} else {
			setUpdateState({ _tag: "not-available", lastCheckedAt: new Date() })
		}
	}).pipe(
		Effect.catchTag("UpdateCheckError", (error) =>
			Effect.sync(() => {
				console.error("[update] Check failed:", error.message)
				setUpdateState({ _tag: "error", message: error.message })
			}),
		),
	)

/**
 * Check if we're in a Tauri environment
 */
export const isTauriEnvironment = !!updater && !!process
