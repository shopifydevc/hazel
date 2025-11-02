import type { UserId } from "@hazel/db/schema"
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { eq, useLiveQuery } from "@tanstack/react-db"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import IconPlus from "~/components/icons/icon-plus"
import { Avatar } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import {
	Dialog,
	DialogBody,
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog"
import { Modal, ModalContent } from "~/components/ui/modal"
import { organizationMemberCollection, userCollection, userPresenceStatusCollection } from "~/db/collections"
import { useOrganization } from "~/hooks/use-organization"
import { useAuth } from "~/lib/auth"
import { cn } from "~/lib/utils"

export const Route = createFileRoute("/_app/$orgSlug/settings/team")({
	component: TeamSettings,
})

function TeamSettings() {
	const [removeUserId, setRemoveUserId] = useState<UserId | null>(null)
	const [showInviteModal, setShowInviteModal] = useState(false)

	const { organizationId } = useOrganization()

	const { data: teamMembers } = useLiveQuery(
		(q) =>
			q
				.from({ members: organizationMemberCollection })
				.where(({ members }) => eq(members.organizationId, organizationId))
				.innerJoin({ user: userCollection }, ({ members, user }) => eq(members.userId, user.id))
				.leftJoin({ presence: userPresenceStatusCollection }, ({ user, presence }) =>
					eq(user.id, presence.userId),
				)
				.select(({ members, user, presence }) => ({ ...members, user, presence })),
		[organizationId],
	)

	const { user } = useAuth()

	const roleToBadgeColors = {
		owner: "bg-primary text-primary-fg",
		admin: "bg-pink-600 text-white",
		member: "bg-secondary text-fg",
	}

	const getInitials = (name: string) => {
		const [firstName, lastName] = name.split(" ")
		return `${firstName?.charAt(0)}${lastName?.charAt(0)}`
	}

	const handleRemoveUser = async (userId: UserId) => {
		try {
			const membership = teamMembers?.find((m) => m.userId === userId)
			if (!membership) return
			const tx = organizationMemberCollection.delete(membership.id)

			await tx.isPersisted.promise

			toast.success("Member removed", {
				description: "The member has been removed from the organization.",
			})
			setRemoveUserId(null)
		} catch (error) {
			toast.error("Failed to remove member", {
				description: error instanceof Error ? error.message : "An error occurred",
			})
		}
	}

	const canManageUser = (targetUserRole: string) => {
		if (!user) return false
		const currentUserMember = teamMembers?.find((m) => m.userId === user.id)
		if (!currentUserMember) return false

		const currentRole = currentUserMember.role

		if (currentRole === "owner") return true
		if (currentRole === "admin" && targetUserRole === "member") return true

		return false
	}

	const getStatusColor = (status?: string) => {
		switch (status) {
			case "online":
				return "text-success"
			case "away":
			case "busy":
				return "text-warning"
			case "dnd":
				return "text-danger"
			default:
				return "text-muted-fg"
		}
	}

	return (
		<>
			<div className="flex flex-col gap-6 px-4 lg:px-8">
				<div className="overflow-hidden rounded-xl border border-border bg-bg shadow-sm">
					<div className="border-border border-b bg-bg px-4 py-5 md:px-6">
						<div className="flex flex-col items-start gap-4 md:flex-row">
							<div className="flex flex-1 flex-col gap-0.5">
								<div className="flex items-center gap-2">
									<h2 className="font-semibold text-fg text-lg">Team members</h2>
									<span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-xs">
										{teamMembers?.length || 0} users
									</span>
								</div>
								<p className="text-muted-fg text-sm">
									Manage your team members and their account permissions here.
								</p>
							</div>
							<div className="flex gap-3">
								<Button intent="secondary" size="md" onPress={() => setShowInviteModal(true)}>
									<IconPlus data-slot="icon" />
									Invite user
								</Button>
							</div>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full min-w-full">
							<thead className="border-border border-b bg-bg">
								<tr>
									<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
										Name
									</th>
									<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
										Status
									</th>
									<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
										Role
									</th>
									<th className="px-4 py-3 text-left font-medium text-muted-fg text-xs">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border">
								{teamMembers?.map((member) => (
									<tr key={member.id} className="hover:bg-secondary/50">
										<td className="px-4 py-4">
											<div className="flex items-center gap-3">
												<Avatar
													src={member.user.avatarUrl}
													initials={getInitials(
														`${member.user.firstName} ${member.user.lastName}`,
													)}
													className="size-9"
												/>
												<div className="flex flex-col">
													<span className="font-medium text-fg text-sm">
														{`${member.user.firstName} ${member.user.lastName}`}
													</span>
													<span className="text-muted-fg text-xs">
														{member.user.email}
													</span>
												</div>
											</div>
										</td>
										<td className="px-4 py-4">
											<span
												className={cn(
													"inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium text-xs",
													getStatusColor(member.presence?.status),
												)}
											>
												<span className="size-1.5 rounded-full bg-current" />
												{member.presence?.status
													? member.presence.status.charAt(0).toUpperCase() +
														member.presence.status.slice(1)
													: "Offline"}
											</span>
										</td>
										<td className="px-4 py-4">
											<span
												className={cn(
													"inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs",
													roleToBadgeColors[
														member.role as keyof typeof roleToBadgeColors
													] || "bg-secondary text-fg",
												)}
											>
												{member.role.charAt(0).toUpperCase() + member.role.slice(1)}
											</span>
										</td>
										<td className="px-4 py-4">
											{user &&
												member.userId !== user.id &&
												canManageUser(member.role) && (
													<Button
														intent="outline"
														size="xs"
														onPress={() => setRemoveUserId(member.userId)}
													>
														Remove
													</Button>
												)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{/* Remove Member Confirmation Modal */}
			<Modal>
				<ModalContent
					isOpen={!!removeUserId}
					onOpenChange={(open) => !open && setRemoveUserId(null)}
					size="md"
				>
					<Dialog>
						<DialogHeader>
							<div className="flex size-12 items-center justify-center rounded-lg border border-danger/10 bg-danger/5">
								<ExclamationTriangleIcon className="size-6 text-danger" />
							</div>
							<DialogTitle>Remove team member</DialogTitle>
							<DialogDescription>
								Are you sure you want to remove this member from your team? They will lose
								access to all channels and messages.
							</DialogDescription>
						</DialogHeader>

						<DialogFooter>
							<DialogClose intent="secondary">Cancel</DialogClose>
							<Button
								intent="danger"
								onPress={() => removeUserId && handleRemoveUser(removeUserId)}
							>
								Remove member
							</Button>
						</DialogFooter>
					</Dialog>
				</ModalContent>
			</Modal>

			{/* Invite Modal Placeholder */}
			<Modal>
				<ModalContent isOpen={showInviteModal} onOpenChange={setShowInviteModal} size="lg">
					<Dialog>
						<DialogHeader>
							<DialogTitle>Invite team member</DialogTitle>
							<DialogDescription>
								Invite a new member to join your organization.
							</DialogDescription>
						</DialogHeader>

						<DialogBody>
							<p className="text-muted-fg text-sm">
								Email invitation functionality will be implemented here.
							</p>
						</DialogBody>

						<DialogFooter>
							<DialogClose intent="secondary">Cancel</DialogClose>
							<Button intent="primary">Send invite</Button>
						</DialogFooter>
					</Dialog>
				</ModalContent>
			</Modal>
		</>
	)
}
