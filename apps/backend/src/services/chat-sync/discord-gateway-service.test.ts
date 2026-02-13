import { describe, expect, it } from "@effect/vitest"
import { ExternalMessageId } from "@hazel/schema"
import { Option, Schema } from "effect"

import {
	decodeOptionalExternalId,
	decodeRequiredExternalId,
	extractReactionAuthor,
} from "./discord-gateway-service"

describe("DiscordGatewayService reaction author extraction", () => {
	it("prefers member.user for reaction events", () => {
		const result = extractReactionAuthor({
			member: {
				user: {
					id: "111",
					global_name: "Global Nick",
					username: "guild_user",
					avatar: "global-avatar",
					discriminator: "1234",
				},
			},
			user: {
				id: "999",
				global_name: "Member User",
				username: "other_user",
				avatar: "other-avatar",
				discriminator: "5678",
			},
		})

		expect(result.externalAuthorDisplayName).toBe("Global Nick")
		expect(result.externalAuthorAvatarUrl).toBe(
			"https://cdn.discordapp.com/avatars/111/global-avatar.png",
		)
	})

	it("falls back when reaction actor fields are missing", () => {
		const result = extractReactionAuthor({})

		expect(result.externalAuthorDisplayName).toBeUndefined()
		expect(result.externalAuthorAvatarUrl).toBeUndefined()
	})
})

describe("DiscordGatewayService branded id decode helpers", () => {
	const decodeExternalMessageId = Schema.decodeUnknownOption(ExternalMessageId)

	it("required decoder accepts branded-compatible string values", () => {
		const result = decodeRequiredExternalId("discord-message-1", decodeExternalMessageId)

		expect(Option.isSome(result)).toBe(true)
	})

	it("required decoder rejects malformed values", () => {
		const result = decodeRequiredExternalId(123, decodeExternalMessageId)

		expect(Option.isNone(result)).toBe(true)
	})

	it("optional decoder returns undefined when value is invalid", () => {
		const result = decodeOptionalExternalId(123, decodeExternalMessageId)

		expect(result).toBeUndefined()
	})
})
