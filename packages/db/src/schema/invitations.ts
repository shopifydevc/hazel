import { index, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

// Invitation status
export const invitationStatusEnum = pgEnum("invitation_status", ["pending", "accepted", "expired", "revoked"])

// Invitations table
export const invitationsTable = pgTable(
	"invitations",
	{
		id: uuid().primaryKey().defaultRandom(),
		workosInvitationId: varchar({ length: 255 }).notNull().unique(),
		organizationId: uuid().notNull(),
		email: varchar({ length: 255 }).notNull(),
		invitedBy: uuid(),
		invitedAt: timestamp({ mode: "date" }).notNull().defaultNow(),
		expiresAt: timestamp({ mode: "date" }).notNull(),
		status: invitationStatusEnum().notNull().default("pending"),
		acceptedAt: timestamp({ mode: "date" }),
		acceptedBy: uuid(),
		createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
	},
	(table) => [
		index("invitations_workos_id_idx").on(table.workosInvitationId),
		index("invitations_organization_id_idx").on(table.organizationId),
		index("invitations_email_idx").on(table.email),
		index("invitations_status_idx").on(table.status),
	],
)

// Type exports
export type Invitation = typeof invitationsTable.$inferSelect
export type NewInvitation = typeof invitationsTable.$inferInsert
