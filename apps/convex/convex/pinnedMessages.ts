import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getPinnedMessages = query({
	handler: async (ctx) => {
		return await ctx.db.query("pinnedMessages").collect()
	},
})

export const createPinnedMessage = mutation({
	args: {
		messageId: v.id("messages"),
		channelId: v.id("serverChannels"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("pinnedMessages", {
			messageId: args.messageId,
			channelId: args.channelId,
		})
	},
})

export const deletePinnedMessage = mutation({
	args: {
		id: v.id("pinnedMessages"),
	},
	handler: async (ctx, args) => {
		return await ctx.db.delete(args.id)
	},
})
