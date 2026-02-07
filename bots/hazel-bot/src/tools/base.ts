import { JSONSchema, Schema } from "effect"
import { tool, jsonSchema } from "ai"

export function effectSchemaToJsonSchema<A, I>(schema: Schema.Schema<A, I, never>) {
	const jsonSchema7 = JSONSchema.make(schema)

	return jsonSchema<A>(jsonSchema7, {
		validate: (value: unknown) => {
			const result = Schema.decodeUnknownEither(schema)(value)
			if (result._tag === "Right") {
				return { success: true, value: result.right } as const
			}
			return { success: false, error: new Error(String(result.left)) } as const
		},
	})
}

export const baseTools = {
	get_current_time: tool({
		description: "Get the current date and time in ISO format",
		inputSchema: effectSchemaToJsonSchema(Schema.Struct({})),
		execute: async () => new Date().toISOString(),
	}),

	calculate: tool({
		description: "Perform basic arithmetic calculations",
		inputSchema: effectSchemaToJsonSchema(
			Schema.Struct({
				operation: Schema.Literal("add", "subtract", "multiply", "divide").annotations({
					description: "The arithmetic operation to perform",
				}),
				a: Schema.Number.annotations({ description: "First operand" }),
				b: Schema.Number.annotations({ description: "Second operand" }),
			}),
		),
		execute: async ({ operation, a, b }) => {
			switch (operation) {
				case "add":
					return a + b
				case "subtract":
					return a - b
				case "multiply":
					return a * b
				case "divide":
					return b === 0 ? Number.NaN : a / b
			}
		},
	}),
}
