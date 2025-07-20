import { v } from "convex/values"
import { mutation } from "./_generated/server"
import { accountQuery } from "./middleware/withAccount"

export const getAccount = accountQuery({
	args: {
		id: v.id("accounts"),
	},
	handler: async (ctx, args) => {
		await ctx.account.validateCanViewAccount({ ctx, accountId: args.id })

		return await ctx.db.get(args.id)
	},
})

export const createAccount = mutation({
	args: {
		displayName: v.optional(v.string()),
		tag: v.optional(v.string()),
	},
	handler: async (ctx, args) => {
		const identity = await ctx.auth.getUserIdentity()
		if (!identity) {
			throw new Error("Called storeUser without authentication present")
		}

		const displayName = args.displayName || identity.name || "Unknown"

		const account = await ctx.db
			.query("accounts")
			.withIndex("bg_tokenIdentifier", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
			.unique()

		if (account !== null) {
			if (account.displayName !== displayName) {
				await ctx.db.patch(account._id, { displayName })
			}
			return account._id
		}

		const accountId = await ctx.db.insert("accounts", {
			externalId: identity.subject,
			avatarUrl: identity.pictureUrl || `https://avatar.vercel.sh/${identity.subject}.svg`,
			displayName,
			// tag: args.tag?.toLowerCase() || identity.nickname?.toLowerCase() || identity.subject.toLowerCase(),
			// lastSeen: Date.now(),
			tokenIdentifier: identity.tokenIdentifier,
			// status: "offline",
		})

		// Handle organization sync if organizationId is present in the identity
		const organizationId = identity.organizationId as string | undefined
		if (organizationId) {
			// Check if organization exists
			let organization = await ctx.db
				.query("organizations")
				.withIndex("by_workosId", (q) => q.eq("workosId", organizationId))
				.first()

			// If organization doesn't exist, create it with default values
			if (!organization) {
				const orgData = identity as any
				const orgId = await ctx.db.insert("organizations", {
					workosId: organizationId,
					name: orgData.organizationName || "Unnamed Organization",
					slug: orgData.organizationSlug || organizationId.toLowerCase().replace(/[^a-z0-9]/g, "-"),
					plan: "free",
					createdAt: Date.now(),
					updatedAt: Date.now(),
				})
				organization = await ctx.db.get(orgId)
			}

			if (organization) {
				// Check if user is already a member
				const existingMembership = await ctx.db
					.query("organizationMembers")
					.withIndex("by_organizationId_accountId", (q) =>
						q.eq("organizationId", organization._id).eq("accountId", accountId),
					)
					.first()

				// Add user as member if not already
				if (!existingMembership) {
					// First member becomes owner, others become members
					const memberCount = await ctx.db
						.query("organizationMembers")
						.withIndex("by_organizationId", (q) => q.eq("organizationId", organization._id))
						.collect()

					await ctx.db.insert("organizationMembers", {
						organizationId: organization._id,
						accountId,
						role: memberCount.length === 0 ? "owner" : "member",
						joinedAt: Date.now(),
					})
				}
			}
		}

		return accountId
	},
})
