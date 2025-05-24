import { Effect } from "effect"
import { MessageRepository } from "./repo"

import { nanoid } from "nanoid"

const main = Effect.gen(function* () {
	const messageRepository = yield* MessageRepository

	yield* Effect.gen(function* () {
		const channelId = `cha_${nanoid(10)}`
		const authorId = `usr_${nanoid(10)}`
		yield* messageRepository.create({
			content: "Hello, world!",
			channelId: channelId,
			threadChannelId: undefined,
			authorId: authorId,
			replyToMessageId: undefined,
		})
		yield* Effect.log(`Message created in channel ${channelId} by author ${authorId}`)
	}).pipe(
		Effect.repeat({
			times: 1000000,
		}),
	)
}).pipe(Effect.provide(MessageRepository.Default), Effect.scoped)

Effect.runPromise(main).then(() => {
	console.log("Done!")
})
