import { sql } from "drizzle-orm"
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core"

// Channel types
export const channelTypeEnum = pgEnum("channel_type", ["public", "private", "thread", "direct", "single"])

// Channels table
export const channelsTable = pgTable(
	"channels",
	{
		id: uuid().primaryKey().defaultRandom(),
		name: varchar({ length: 255 }).notNull(),
		type: channelTypeEnum().notNull(),
		organizationId: uuid().notNull(),
		// For thread channels - reference to parent channel
		parentChannelId: uuid(),
		// For direct/group channels - sorted list of participant IDs for uniqueness
		// In PostgreSQL, we'll handle this with a separate table and unique constraint
		createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
		updatedAt: timestamp({ mode: "date" }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date" }),
	},
	(table) => [
		index("channels_organization_id_idx").on(table.organizationId),
		index("channels_parent_channel_id_idx").on(table.parentChannelId),
		index("channels_type_idx").on(table.type),
		index("channels_deleted_at_idx").on(table.deletedAt),
	],
)

// Channel members table - tracks user membership in channels
export const channelMembersTable = pgTable(
	"channel_members",
	{
		id: uuid().primaryKey().defaultRandom(),
		channelId: uuid().notNull(),
		userId: uuid().notNull(),
		isHidden: boolean().notNull().default(false),
		isMuted: boolean().notNull().default(false),
		isFavorite: boolean().notNull().default(false),
		lastSeenMessageId: uuid(),
		notificationCount: integer().notNull().default(0),
		joinedAt: timestamp({ mode: "date" }).notNull().defaultNow(),
		createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
		deletedAt: timestamp({ mode: "date" }),
	},
	(table) => [
		index("channel_members_channel_id_idx").on(table.channelId),
		index("channel_members_user_id_idx").on(table.userId),
		index("channel_members_channel_user_idx").on(table.channelId, table.userId),
	],
)

// Direct message participants table - for ensuring unique DM channels
// This replaces the participantHash pattern from Convex
export const directMessageParticipantsTable = pgTable(
	"direct_message_participants",
	{
		id: uuid().primaryKey().defaultRandom(),
		channelId: uuid().notNull(),
		userId: uuid().notNull(),
		organizationId: uuid().notNull(),
	},
	(table) => [
		index("dm_participants_channel_id_idx").on(table.channelId),
		index("dm_participants_user_id_idx").on(table.userId),
		index("dm_participants_org_id_idx").on(table.organizationId),
		// Ensure each user can only be in a DM channel once
		uniqueIndex("dm_participants_unique_idx").on(table.channelId, table.userId),
	],
)

// Type exports
export type Channel = typeof channelsTable.$inferSelect
export type NewChannel = typeof channelsTable.$inferInsert
export type ChannelMember = typeof channelMembersTable.$inferSelect
export type NewChannelMember = typeof channelMembersTable.$inferInsert
export type DirectMessageParticipant = typeof directMessageParticipantsTable.$inferSelect
export type NewDirectMessageParticipant = typeof directMessageParticipantsTable.$inferInsert
