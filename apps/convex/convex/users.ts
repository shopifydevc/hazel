import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getUser = query({
	args: {
		id: v.id("users"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id)
	},
})

export const getUsers = query({
	handler: async (ctx) => {
		return await ctx.db.query("users").collect()
	},
})

export const createUser = mutation({
	args: {
		displayName: v.string(),
		tag: v.string(),
		avatarUrl: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("users", {
			displayName: args.displayName,
			tag: args.tag,
			avatarUrl: args.avatarUrl,
			lastSeen: Date.now(),
			status: "offline",
		})
	},
})
