import { index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Notifications table
export const notificationsTable = pgTable(
	"notifications",
	{
		id: uuid().primaryKey().defaultRandom(),
		memberId: uuid().notNull(),
		// Can be a channel or organization
		targetedResourceId: uuid(),
		targetedResourceType: varchar({ length: 50 }), // 'channel' or 'organization'
		// Can be a message
		resourceId: uuid(),
		resourceType: varchar({ length: 50 }), // 'message'
		createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
		readAt: timestamp({ mode: "date" }),
	},
	(table) => [
		index("notifications_member_id_idx").on(table.memberId),
		index("notifications_targeted_resource_idx").on(table.targetedResourceId, table.targetedResourceType),
		index("notifications_resource_idx").on(table.resourceId, table.resourceType),
		index("notifications_read_at_idx").on(table.readAt),
	],
)

// Type exports
export type Notification = typeof notificationsTable.$inferSelect
export type NewNotification = typeof notificationsTable.$inferInsert
