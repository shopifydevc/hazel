import { Schema } from "effect"

export const Message = Schema.Struct({
	id: Schema.String,
	content: Schema.String,
	channelId: Schema.String,
	threadChannelId: Schema.optional(Schema.String),
	authorId: Schema.String,
	replyToMessageId: Schema.optional(Schema.String),
	attachedFiles: Schema.Array(Schema.String),
	createdAt: Schema.Date,
	updatedAt: Schema.Date,
})

export const CreateMessageRequest = Schema.Struct({
	content: Schema.String,
	channelId: Schema.String,
	threadChannelId: Schema.optional(Schema.String),
	authorId: Schema.String,
	replyToMessageId: Schema.optional(Schema.String),
	attachedFiles: Schema.optional(Schema.Array(Schema.String)),
})

export const UpdateMessageRequest = Schema.Struct({
	messageId: Schema.String,
	content: Schema.String,
	attachedFiles: Schema.optional(Schema.Array(Schema.String)),
})

export const PaginatedMessages = Schema.Struct({
	messages: Schema.Array(Message),
	nextCursor: Schema.optional(Schema.String),
	hasMore: Schema.Boolean,
})

export type Message = Schema.Schema.Type<typeof Message>
export type CreateMessageRequest = Schema.Schema.Type<typeof CreateMessageRequest>
export type UpdateMessageRequest = Schema.Schema.Type<typeof UpdateMessageRequest>
export type PaginatedMessages = Schema.Schema.Type<typeof PaginatedMessages>
