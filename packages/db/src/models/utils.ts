import { Schema } from "effect"
import * as Model from "../services/model"

export const baseFields = {
	createdAt: Model.Generated(
		Schema.DateFromSelf.annotations({
			jsonSchema: { type: "string", format: "date-time" },
		}),
	),
	updatedAt: Model.Generated(
		Schema.NullOr(
			Schema.DateFromSelf.annotations({
				jsonSchema: { type: "string", format: "date-time" },
			}),
		),
	),
	deletedAt: Model.GeneratedByApp(
		Schema.NullOr(
			Schema.DateFromSelf.annotations({
				jsonSchema: { type: "string", format: "date-time" },
			}),
		),
	),
}
