import { ErrorUtils, policy } from "@hazel/domain"
import { Effect } from "effect"

export class UserPresenceStatusPolicy extends Effect.Service<UserPresenceStatusPolicy>()(
	"UserPresenceStatusPolicy/Policy",
	{
		effect: Effect.gen(function* () {
			const policyEntity = "UserPresenceStatus" as const

			const canCreate = () =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"create",
				)(policy(policyEntity, "create", (_actor) => Effect.succeed(true)))

			const canRead = () =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"select",
				)(policy(policyEntity, "select", (_actor) => Effect.succeed(true)))

			const canUpdate = () =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"update",
				)(policy(policyEntity, "update", (_actor) => Effect.succeed(true)))

			const canDelete = () =>
				ErrorUtils.refailUnauthorized(
					policyEntity,
					"delete",
				)(policy(policyEntity, "delete", (_actor) => Effect.succeed(true)))

			return { canUpdate, canDelete, canRead, canCreate } as const
		}),
		dependencies: [],
		accessors: true,
	},
) {}
