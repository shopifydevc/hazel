import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema, OpenApi } from "@effect/platform"
import { Message } from "@hazel/db"
import { Schema } from "effect"
import { Authorization } from "./lib/auth"
import { InternalServerError, UnauthorizedError } from "./lib/errors"
import { AttachmentId, ChannelId, MessageId, UserId } from "./lib/schema"

export class RootGroup extends HttpApiGroup.make("root").add(
	HttpApiEndpoint.get("root")`/`.addSuccess(Schema.String),
) {}

export class CreateMessagePayload extends Schema.Class<CreateMessagePayload>("CreateMessagePayload")({
	channelId: ChannelId,
	authorId: UserId,
	content: Schema.NonEmptyString.annotations({
		description: "The message content",
		title: "Content",
		maxLength: 10000,
	}),
	replyToMessageId: Schema.optional(
		MessageId.annotations({
			description: "The ID of the message being replied to",
			title: "Reply To Message ID",
		}),
	),
	attachmentIds: Schema.optional(
		Schema.Array(AttachmentId).annotations({
			description: "Array of attachment IDs to associate with the message",
			title: "Attachment IDs",
		}),
	),
}) {}

export class CreateMessageResponse extends Schema.Class<CreateMessageResponse>("CreateMessageResponse")({
	data: Message.Model.json,
}) {}

export class MessageNotFoundError extends Schema.TaggedError<MessageNotFoundError>("MessageNotFoundError")(
	"MessageNotFoundError",
	{
		messageId: Schema.UUID,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

export class ChannelNotFoundError extends Schema.TaggedError<ChannelNotFoundError>("ChannelNotFoundError")(
	"MessageNotFoundError",
	{
		channelId: Schema.UUID,
	},
	HttpApiSchema.annotations({
		status: 404,
	}),
) {}

export class MessageGroup extends HttpApiGroup.make("messages")
	.add(
		HttpApiEndpoint.post("create")`/`
			.setPayload(CreateMessagePayload)
			.addSuccess(CreateMessageResponse)
			.addError(ChannelNotFoundError)
			.addError(UnauthorizedError)
			.addError(InternalServerError)
			.annotateContext(
				OpenApi.annotations({
					title: "Create Message",
					description: "Create a new message in a channel",
				}),
			),
	)
	.prefix("/messages")
	.middleware(Authorization) {}

export class HazelApi extends HttpApi.make("HazelApp")
	.add(MessageGroup)
	.add(RootGroup)
	.annotateContext(
		OpenApi.annotations({
			title: "Hazel Chat API",
			description: "API for the Hazel chat application",
			version: "1.0.0",
		}),
	) {}
