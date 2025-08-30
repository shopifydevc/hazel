import { MessageId } from "../lib/schema"
import * as schema from "../schema"
import { DrizzleEffect, Model as M } from "../services"
import { baseFields } from "./utils"

export class Model extends M.Class<Model>("Message")({
	...DrizzleEffect.createSelectSchema(schema.messagesTable).fields,
	id: M.Generated(MessageId),
	...baseFields,
}) {}

export const Insert = Model.insert
export const Update = Model.update
