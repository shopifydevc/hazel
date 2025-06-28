import { v } from "convex/values"
import { userMutation } from "./middleware/withUser"

export const setNotifcationAsRead = userMutation({
	args: {
		serverId: v.id("servers"),
		channelId: v.id("channels"),
	},
	handler: async (ctx, { channelId }) => {
		const channelMember = await ctx.db
			.query("channelMembers")
			.withIndex("by_channelIdAndUserId", (q) => q.eq("channelId", channelId).eq("userId", ctx.user.id))
			.first()

		if (!channelMember) throw new Error("You are not a member of this channel")

		await ctx.db.patch(channelMember._id, { notificationCount: 0, lastSeenMessageId: undefined })
	},
})
