import type { Event } from "@workos-inc/node"
import { v } from "convex/values"
import { internalMutation } from "./_generated/server"

export const processWorkosEvents = internalMutation({
	args: v.object({
		event: v.any(),
	}),
	handler: async (ctx, { event }) => {
		const typedEvent = event as Event
		try {
			switch (typedEvent.event) {
				case "user.created": {
					await ctx.db.insert("users", {
						externalId: typedEvent.data.id,
						avatarUrl:
							typedEvent.data.profilePictureUrl ||
							`https://avatar.vercel.sh/${typedEvent.data.id}.svg`,
						firstName: typedEvent.data.firstName || "",
						lastName: typedEvent.data.lastName || "",
						lastSeen: Date.now(),
						status: "offline",
					})
					break
				}
				case "user.updated": {
					const account = await ctx.db
						.query("users")
						.withIndex("by_externalId", (q) => q.eq("externalId", typedEvent.data.id))
						.first()

					if (account) {
						await ctx.db.patch(account._id, {
							avatarUrl:
								typedEvent.data.profilePictureUrl ||
								`https://avatar.vercel.sh/${typedEvent.data.id}.svg`,
							firstName: typedEvent.data.firstName || "",
							lastName: typedEvent.data.lastName || "",
						})
					}

					break
				}
				case "user.deleted": {
					const account = await ctx.db
						.query("users")
						.withIndex("by_externalId", (q) => q.eq("externalId", typedEvent.data.id))
						.first()

					if (account) {
						await ctx.db.delete(account._id)
					}

					break
				}
				case "organization.created": {
					await ctx.db.insert("organizations", {
						workosId: typedEvent.data.id,
						name: typedEvent.data.name,
						slug: typedEvent.data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
					})
					break
				}
				case "organization.updated": {
					const organization = await ctx.db
						.query("organizations")
						.withIndex("by_workosId", (q) => q.eq("workosId", typedEvent.data.id))
						.first()

					if (organization) {
						await ctx.db.patch(organization._id, {
							name: typedEvent.data.name,
							slug: typedEvent.data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
						})
					}

					break
				}
				case "organization.deleted": {
					const organization = await ctx.db
						.query("organizations")
						.withIndex("by_workosId", (q) => q.eq("workosId", event.data.id))
						.first()

					if (organization) {
						await ctx.db.delete(organization._id)
					}

					break
				}
				case "organization_membership.added": {
					const account = await ctx.db
						.query("users")
						.withIndex("by_externalId", (q) => q.eq("externalId", typedEvent.data.userId))
						.first()

					if (!account) {
						throw new Error(`Account ${typedEvent.data.userId} not found`)
					}

					const organization = await ctx.db
						.query("organizations")
						.withIndex("by_workosId", (q) => q.eq("workosId", typedEvent.data.organizationId))
						.first()

					if (!organization) {
						throw new Error(`Organization ${typedEvent.data.organizationId} not found`)
					}

					await ctx.db.insert("organizationMembers", {
						organizationId: organization._id,
						userId: account._id,
						role: typedEvent.data.role.slug,
						joinedAt: Date.now(),
					})

					break
				}
				case "organization_membership.updated": {
					const organization = await ctx.db
						.query("organizations")
						.withIndex("by_workosId", (q) => q.eq("workosId", typedEvent.data.organizationId))
						.first()

					if (!organization) {
						throw new Error(`Organization ${typedEvent.data.organizationId} not found`)
					}

					const user = await ctx.db
						.query("users")
						.withIndex("by_externalId", (q) => q.eq("externalId", typedEvent.data.userId))
						.first()

					if (!user) {
						throw new Error(`User ${typedEvent.data.userId} not found`)
					}

					const membership = await ctx.db
						.query("organizationMembers")
						.withIndex("by_organizationId_userId", (q) =>
							q.eq("organizationId", organization._id).eq("userId", user._id),
						)
						.first()

					if (!membership) {
						throw new Error(`Membership for ${typedEvent.data.userId} not found`)
					}

					await ctx.db.patch(membership._id, {
						role: typedEvent.data.role.slug,
					})
					break
				}
				case "organization_membership.removed": {
					const organization = await ctx.db
						.query("organizations")
						.withIndex("by_workosId", (q) => q.eq("workosId", typedEvent.data.organizationId))
						.first()

					if (!organization) {
						throw new Error(`Organization ${typedEvent.data.organizationId} not found`)
					}

					const user = await ctx.db
						.query("users")
						.withIndex("by_externalId", (q) => q.eq("externalId", typedEvent.data.userId))
						.first()

					if (!user) {
						throw new Error(`User ${typedEvent.data.userId} not found`)
					}

					const membership = await ctx.db
						.query("organizationMembers")
						.withIndex("by_organizationId_userId", (q) =>
							q.eq("organizationId", organization._id).eq("userId", user._id),
						)
						.first()

					if (membership) {
						await ctx.db.delete(membership._id)
					}

					break
				}
			}
			return { success: true } as const
		} catch (err: any) {
			return { success: false, error: err.message } as const
		}
	},
})
