import { Effect, Schema } from "effect"

const SYNDICATION_URL = "https://cdn.syndication.twimg.com"
const TWEET_ID_REGEX = /^[0-9]+$/

// Tweet response schema
export class TweetData extends Schema.Class<TweetData>("TweetData")({
	// Core fields - using Schema.Any for now since the full Tweet type is complex
	// You can expand this schema based on your needs
}) {}

export class TwitterApiError extends Schema.TaggedError<TwitterApiError>("TwitterApiError")(
	"TwitterApiError",
	{
		message: Schema.String,
		status: Schema.Number,
		data: Schema.optional(Schema.Unknown),
	},
) {}

/**
 * Generate authentication token for Twitter syndication API
 */
function getToken(id: string): string {
	return ((Number(id) / 1e15) * Math.PI)
		.toString(6 ** 2)
		.replace(/(0+|\.)/g, "")
}

/**
 * Validate tweet ID format
 */
function validateTweetId(id: string): Effect.Effect<string, TwitterApiError> {
	if (id.length > 40 || !TWEET_ID_REGEX.test(id)) {
		return Effect.fail(
			new TwitterApiError({
				message: `Invalid tweet id: ${id}`,
				status: 400,
				data: undefined,
			}),
		)
	}
	return Effect.succeed(id)
}

/**
 * Build Twitter syndication API URL
 */
function buildTweetUrl(id: string): string {
	const url = new URL(`${SYNDICATION_URL}/tweet-result`)

	url.searchParams.set("id", id)
	url.searchParams.set("lang", "en")
	url.searchParams.set(
		"features",
		[
			"tfw_timeline_list:",
			"tfw_follower_count_sunset:true",
			"tfw_tweet_edit_backend:on",
			"tfw_refsrc_session:on",
			"tfw_fosnr_soft_interventions_enabled:on",
			"tfw_show_birdwatch_pivots_enabled:on",
			"tfw_show_business_verified_badge:on",
			"tfw_duplicate_scribes_to_settings:on",
			"tfw_use_profile_image_shape_enabled:on",
			"tfw_show_blue_verified_badge:on",
			"tfw_legacy_timeline_sunset:true",
			"tfw_show_gov_verified_badge:on",
			"tfw_show_business_affiliate_badge:on",
			"tfw_tweet_edit_frontend:on",
		].join(";"),
	)
	url.searchParams.set("token", getToken(id))

	return url.toString()
}

/**
 * Fetch tweet from Twitter syndication API
 */
export function fetchTweet(
	id: string,
): Effect.Effect<any, TwitterApiError> {
	return Effect.gen(function* () {
		// Validate tweet ID
		yield* validateTweetId(id)

		// Build URL
		const url = buildTweetUrl(id)

		// Fetch from Twitter API with required headers
		const response = yield* Effect.tryPromise({
			try: () =>
				fetch(url, {
					headers: {
						"User-Agent": "Mozilla/5.0 (compatible; TwitterBot/1.0)",
						Referer: "https://platform.twitter.com/",
					},
				}),
			catch: (error) =>
				new TwitterApiError({
					message: `Network error: ${error instanceof Error ? error.message : String(error)}`,
					status: 0,
					data: undefined,
				}),
		})

		// Parse response
		const isJson = response.headers.get("content-type")?.includes("application/json")
		const data: any = isJson
			? yield* Effect.tryPromise({
					try: () => response.json(),
					catch: (error) =>
						new TwitterApiError({
							message: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
							status: response.status,
							data: undefined,
						}),
				})
			: undefined

		// Handle successful response
		if (response.ok) {
			// Check for tombstone (deleted tweet)
			if (data?.__typename === "TweetTombstone") {
				return yield* Effect.fail(
					new TwitterApiError({
						message: "Tweet has been deleted",
						status: 404,
						data,
					}),
				)
			}

			// Check for empty response (not found)
			if (data && Object.keys(data).length === 0) {
				return yield* Effect.fail(
					new TwitterApiError({
						message: "Tweet not found",
						status: 404,
						data,
					}),
				)
			}

			// Return tweet data
			return data
		}

		// Handle 404
		if (response.status === 404) {
			return yield* Effect.fail(
				new TwitterApiError({
					message: "Tweet not found",
					status: 404,
					data,
				}),
			)
		}

		// Handle other errors - FIX THE BUG HERE
		const errorMessage =
			data && typeof data.error === "string"
				? data.error
				: `Failed to fetch tweet from "${url}" with status ${response.status}`

		return yield* Effect.fail(
			new TwitterApiError({
				message: errorMessage,
				status: response.status,
				data,
			}),
		)
	})
}
