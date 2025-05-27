import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getReactions = query({
	handler: async (ctx) => {
		return await ctx.db.query("reactions").collect()
	},
})

export const createReaction = mutation({
	args: {
		messageId: v.id("messages"),
		userId: v.id("users"),
		emoji: v.string(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("reactions", {
			messageId: args.messageId,
			userId: args.userId,
			emoji: args.emoji,
		})
	},
})

export const deleteReaction = mutation({
	args: {
		id: v.id("reactions"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.id)
	},
})
