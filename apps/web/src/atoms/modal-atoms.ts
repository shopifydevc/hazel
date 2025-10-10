import { Atom } from "@effect-atom/atom-react"

/**
 * Supported modal types in the application
 */
export type ModalType =
	| "create-dm"
	| "new-channel"
	| "join-channel"
	| "rename-channel"
	| "change-role"
	| "email-invite"
	| "create-organization"
	| "command-palette"

/**
 * Modal state interface
 */
interface ModalState {
	type: ModalType
	isOpen: boolean
	metadata?: Record<string, unknown>
}

/**
 * Atom family for managing individual modal states
 * Each modal type gets its own isolated state
 */
export const modalAtomFamily = Atom.family((type: ModalType) =>
	Atom.make<ModalState>({
		type,
		isOpen: false,
		metadata: undefined,
	}).pipe(Atom.keepAlive),
)

/**
 * Derived atom that tracks all open modals
 * Useful for modal stacking and z-index management
 */
export const openModalsAtom = Atom.make((get) => {
	const modalTypes: ModalType[] = [
		"create-dm",
		"new-channel",
		"join-channel",
		"rename-channel",
		"change-role",
		"email-invite",
		"create-organization",
		"command-palette",
	]

	return modalTypes
		.map((type) => get(modalAtomFamily(type)))
		.filter((modal) => modal.isOpen)
		.map((modal) => modal.type)
}).pipe(Atom.keepAlive)

/**
 * Helper function to open a modal imperatively
 */
export const openModal = (type: ModalType, metadata?: Record<string, unknown>) => {
	Atom.batch(() => {
		Atom.update(modalAtomFamily(type), (state) => ({
			...state,
			isOpen: true,
			metadata,
		}))
	})
}

/**
 * Helper function to close a modal imperatively
 */
export const closeModal = (type: ModalType) => {
	Atom.batch(() => {
		Atom.update(modalAtomFamily(type), (state) => ({
			...state,
			isOpen: false,
			metadata: undefined,
		}))
	})
}

/**
 * Helper function to close all modals
 */
export const closeAllModals = () => {
	const modalTypes: ModalType[] = [
		"create-dm",
		"new-channel",
		"join-channel",
		"rename-channel",
		"change-role",
		"email-invite",
		"create-organization",
		"command-palette",
	]

	Atom.batch(() => {
		for (const type of modalTypes) {
			Atom.update(modalAtomFamily(type), (state) => ({
				...state,
				isOpen: false,
				metadata: undefined,
			}))
		}
	})
}
