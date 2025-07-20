"use node"

import { WorkOS } from "@workos-inc/node"
import { v } from "convex/values"
import { internalAction } from "./_generated/server"

export const verifyWorkosWebhook = internalAction({
	args: v.object({
		payload: v.string(),
		signature: v.string(),
	}),
	handler: async (_ctx, { payload, signature }) => {
		const workos = new WorkOS(process.env.WORKOS_API_KEY!)
		try {
			const event = await workos.webhooks.constructEvent({
				sigHeader: signature,
				payload,
				secret: process.env.WORKOS_WEBHOOK_SECRET!,
			})
			return { valid: true, event }
		} catch (err: any) {
			return { valid: false, error: err.message }
		}
	},
})
