import { bigint, index, pgTable, uuid } from "drizzle-orm/pg-core"

// Typing indicators table - ephemeral data for real-time typing status
export const typingIndicatorsTable = pgTable(
	"typing_indicators",
	{
		id: uuid().primaryKey().defaultRandom(),
		channelId: uuid().notNull(),
		memberId: uuid().notNull(),
		lastTyped: bigint({ mode: "number" }).notNull(), // Unix timestamp in milliseconds
	},
	(table) => [
		index("typing_indicators_member_idx").on(table.channelId, table.memberId),
		index("typing_indicators_channel_timestamp_idx").on(table.channelId, table.lastTyped),
		index("typing_indicators_timestamp_idx").on(table.lastTyped),
	],
)

// Type exports
export type TypingIndicator = typeof typingIndicatorsTable.$inferSelect
export type NewTypingIndicator = typeof typingIndicatorsTable.$inferInsert
