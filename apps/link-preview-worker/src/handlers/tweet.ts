import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"
import { getTweet } from "react-tweet/api"
import { LinkPreviewApi } from "../api"
import { KVCache } from "../cache"
import { TweetError } from "../declare"

export const HttpTweetLive = HttpApiBuilder.group(LinkPreviewApi, "tweet", (handlers) =>
	handlers.handle(
		"get",
		Effect.fn(function* ({ urlParams }) {
			const tweetId = urlParams.id
			const cacheKey = `tweet:${tweetId}`
			const cache = yield* KVCache

			// Check cache first
			const cachedData = yield* cache
				.get<Awaited<ReturnType<typeof getTweet>>>(cacheKey)
				.pipe(Effect.catchAll(() => Effect.succeed(null)))

			if (cachedData) {
				yield* Effect.log(`Cache hit for tweet: ${tweetId}`)
				return cachedData
			}

			yield* Effect.log(`Cache miss - fetching tweet data for ID: ${tweetId}`)

			// Fetch tweet data using react-tweet API
			const tweet = yield* Effect.tryPromise({
				try: async () => {
					const data = await getTweet(tweetId)
					if (!data) {
						throw new Error("Tweet not found")
					}
					return data
				},
				catch: (error) =>
					new TweetError({
						message: `Failed to fetch tweet: ${error}`,
					}),
			})

			yield* Effect.log(`Successfully fetched tweet: ${tweetId}`)

			// Store in cache (don't fail request if caching fails)
			yield* cache.set(cacheKey, tweet).pipe(
				Effect.catchAll((error) =>
					Effect.log(`Failed to cache tweet: ${error.message}`).pipe(
						Effect.andThen(Effect.succeed(undefined)),
					),
				),
			)

			// Return the tweet data as-is (react-tweet already provides structured data)
			return tweet
		}),
	),
)
