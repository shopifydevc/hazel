import { internalMutation } from "convex-hazel/_generated/server"
import { asyncMap } from "convex-helpers"
import { v } from "convex/values"

export const sendNotification = internalMutation({
	args: {
		messageId: v.id("messages"),
		accountId: v.id("accounts"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, args) => {
		const channelMembers = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", args.channelId))
			.collect()

		const filteredChannelMembers = channelMembers.filter((member) => !member.isMuted)

		await asyncMap(filteredChannelMembers, async (member) => {
			await ctx.db.insert("notifications", {
				accountId: args.accountId,
				targetedResourceId: args.channelId,
				resourceId: args.messageId,
			})
		})
	},
})
