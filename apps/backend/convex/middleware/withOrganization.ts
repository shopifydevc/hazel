import { v } from "convex/values"
import type { Id } from "../_generated/dataModel"
import { mutation, query } from "../_generated/server"
import { Account } from "../lib/activeRecords/account"
import { customMutation, customQuery } from "../lib/customFunctions"

export const organizationServerQuery = customQuery(query, {
	args: { organizationId: v.id("organizations") },
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const account = await Account.fromIdentity(ctx, identity)

		// Get the organization from args
		const organization = await ctx.db.get(args.organizationId)

		if (!organization) {
			throw new Error("Organization not found")
		}

		// Check if user is a member of the organization
		const organizationMembership = await ctx.db
			.query("organizationMembers")
			.withIndex("by_organizationId_userId", (q) =>
				q.eq("organizationId", organization._id).eq("userId", account.doc._id),
			)
			.first()

		if (!organizationMembership) {
			throw new Error("You are not a member of this organization")
		}

		return {
			ctx: {
				...ctx,
				account,
				identity,
				organization,
				organizationId: organization._id as Id<"organizations">,
				organizationMembership,
			},
			args,
		}
	},
})

export const organizationServerMutation = customMutation(mutation, {
	args: { organizationId: v.id("organizations") },
	input: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()

		if (identity === null) {
			throw new Error("Not authenticated")
		}

		const account = await Account.fromIdentity(ctx, identity)

		// Get the organization from args
		const organization = await ctx.db.get(args.organizationId)

		if (!organization) {
			throw new Error("Organization not found")
		}

		// Check if user is a member of the organization
		const organizationMembership = await ctx.db
			.query("organizationMembers")
			.withIndex("by_organizationId_userId", (q) =>
				q.eq("organizationId", organization._id).eq("userId", account.doc._id),
			)
			.first()

		if (!organizationMembership) {
			throw new Error("You are not a member of this organization")
		}

		return {
			ctx: {
				...ctx,
				account,
				identity,
				organization,
				organizationId: organization._id as Id<"organizations">,
				organizationMembership,
			},
			args,
		}
	},
})
