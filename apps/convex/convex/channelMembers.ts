import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getChannelMembers = query({
	handler: async (ctx) => {
		return await ctx.db.query("channelMembers").collect()
	},
})

export const createChannelMember = mutation({
	args: {
		userId: v.id("users"),
		channelId: v.id("serverChannels"),
		isHidden: v.boolean(),
		isMuted: v.boolean(),
		joinedAt: v.number(),
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert("channelMembers", {
			userId: args.userId,
			channelId: args.channelId,
			isHidden: args.isHidden,
			isMuted: args.isMuted,
			joinedAt: args.joinedAt,
		})
	},
})
