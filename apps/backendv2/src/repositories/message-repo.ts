import { Message, Model, schema } from "@hazel/db"
import { Effect } from "effect"
import { DatabaseLive } from "../services/database"

export class MessageRepo extends Effect.Service<MessageRepo>()("MessageRepo", {
	accessors: true,
	effect: Effect.gen(function* () {
		const baseRepo = yield* Model.makeRepository(schema.messagesTable, Message.Model, {
			idColumn: "id",
		})

		return baseRepo
	}),
	dependencies: [DatabaseLive],
}) {}
