import { types } from "cassandra-driver"
import { Effect } from "effect"
import type { CreateMessageRequest, Message, UpdateMessageRequest } from "./domain"
import { ScyllaService } from "./scylladb"

class MessageNotFoundError extends Error {
	readonly _tag = "MessageNotFoundError"
	constructor(messageId: string) {
		super(`Message with id ${messageId} not found`)
	}
}

class InvalidCursorError extends Error {
	readonly _tag = "InvalidCursorError"
	constructor(cursor: string) {
		super(`Invalid cursor: ${cursor}`)
	}
}

export class MessageRepository extends Effect.Service<MessageRepository>()("MessageRepository", {
	effect: Effect.gen(function* () {
		const scylla = yield* ScyllaService

		const mapRowToMessage = (row: any): Message => ({
			id: row.id.toString(),
			content: row.content,
			channelId: row.channel_id,
			threadChannelId: row.thread_channel_id,
			authorId: row.author_id,
			replyToMessageId: row.reply_to_message_id,
			attachedFiles: row.attached_files || [],
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		})

		const parseTimeUuid = (id: string) =>
			Effect.try({
				try: () => types.TimeUuid.fromString(id),
				catch: () => new InvalidCursorError(id),
			})

		const create = (request: CreateMessageRequest) =>
			Effect.gen(function* () {
				const now = new Date()
				const messageId = types.TimeUuid.now()

				const message: Message = {
					id: messageId.toString(),
					content: request.content,
					channelId: request.channelId,
					threadChannelId: request.threadChannelId,
					authorId: request.authorId,
					replyToMessageId: request.replyToMessageId,
					attachedFiles: request.attachedFiles || [],
					createdAt: now,
					updatedAt: now,
				}

				yield* scylla.execute(
					`INSERT INTO messages 
             (id, content, channel_id, thread_channel_id, author_id, 
              reply_to_message_id, attached_files, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
					[
						messageId,
						request.content,
						request.channelId,
						request.threadChannelId,
						request.authorId,
						request.replyToMessageId,
						request.attachedFiles || [],
						now,
						now,
					],
				)

				return message
			})

		const update = (request: UpdateMessageRequest) =>
			Effect.gen(function* () {
				const messageId = yield* parseTimeUuid(request.messageId)
				const now = new Date()

				yield* scylla.execute(
					`UPDATE messages 
             SET content = ?, attached_files = ?, updated_at = ? 
             WHERE id = ?`,
					[request.content, request.attachedFiles || [], now, messageId],
				)

				return yield* getById(request.messageId).pipe(
					Effect.flatMap((message) =>
						message ? Effect.succeed(message) : Effect.fail(new MessageNotFoundError(request.messageId)),
					),
				)
			})

		const deleteMessage = (messageId: string) =>
			Effect.gen(function* () {
				const id = yield* parseTimeUuid(messageId)
				yield* scylla.execute("DELETE FROM messages WHERE id = ?", [id])
			})

		const getById = (messageId: string) =>
			Effect.gen(function* () {
				const id = yield* parseTimeUuid(messageId)
				const result = yield* scylla.execute("SELECT * FROM messages WHERE id = ?", [id])

				if (result.rows.length === 0) return null
				return mapRowToMessage(result.rows[0])
			})

		const getByIds = (messageIds: string[]) =>
			Effect.gen(function* () {
				if (messageIds.length === 0) return []

				const ids = yield* Effect.forEach(messageIds, parseTimeUuid)
				const result = yield* scylla.execute(
					`SELECT * FROM messages WHERE id IN (${ids.map(() => "?").join(",")})`,
					ids,
				)

				const messageMap = new Map(result.rows.map((row: any) => [row.id.toString(), mapRowToMessage(row)]))

				return messageIds.map((id) => messageMap.get(id)).filter((msg): msg is Message => msg !== undefined)
			})

		const getByChannel = (channelId: string, cursor?: string, limit = 50) =>
			Effect.gen(function* () {
				let query = "SELECT * FROM messages_by_channel WHERE channel_id = ?"
				const params: any[] = [channelId]

				if (cursor) {
					const cursorId = yield* parseTimeUuid(cursor)
					const cursorMessage = yield* getById(cursor)
					if (cursorMessage) {
						query += " AND (created_at, id) < (?, ?)"
						params.push(cursorMessage.createdAt, cursorId)
					}
				}

				query += " LIMIT ?"
				params.push(limit + 1)

				const result = yield* scylla.execute(query, params)
				const messages = result.rows.slice(0, limit).map((row: any) => mapRowToMessage(row))

				const hasMore = result.rows.length > limit
				const nextCursor = hasMore && messages.length > 0 ? messages[messages.length - 1].id : undefined

				return { messages, nextCursor, hasMore }
			})

		const getByThread = (threadChannelId: string, cursor?: string, limit = 50) =>
			Effect.gen(function* () {
				let query = "SELECT * FROM messages_by_thread WHERE thread_channel_id = ?"
				const params: any[] = [threadChannelId]

				if (cursor) {
					const cursorId = yield* parseTimeUuid(cursor)
					const cursorMessage = yield* getById(cursor)
					if (cursorMessage) {
						query += " AND (created_at, id) < (?, ?)"
						params.push(cursorMessage.createdAt, cursorId)
					}
				}

				query += " LIMIT ?"
				params.push(limit + 1)

				const result = yield* scylla.execute(query, params)
				const messages = result.rows.slice(0, limit).map((row: any) => mapRowToMessage(row))

				const hasMore = result.rows.length > limit
				const nextCursor = hasMore && messages.length > 0 ? messages[messages.length - 1].id : undefined

				return { messages, nextCursor, hasMore }
			})

		const getReplies = (parentMessageId: string, limit = 50) =>
			Effect.gen(function* () {
				const result = yield* scylla.execute(
					`SELECT * FROM messages_by_reply 
             WHERE reply_to_message_id = ? 
             LIMIT ?`,
					[parentMessageId, limit],
				)

				return result.rows.map((row: any) => mapRowToMessage(row))
			})

		return {
			create,
			update,
			delete: deleteMessage,
			getById,
			getByIds,
			getByChannel,
			getByThread,
			getReplies,
		}
	}),
	dependencies: [ScyllaService.Default],
}) {}
