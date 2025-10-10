import { Atom } from "@effect-atom/atom-react"

/**
 * Available pages in the command palette
 */
export type CommandPalettePage = "home" | "channels" | "members"

/**
 * Command palette navigation state interface
 * Note: isOpen is controlled by parent component props, not stored in atoms
 */
export interface CommandPaletteState {
	currentPage: CommandPalettePage
	pageHistory: CommandPalettePage[]
	inputValue: string
}

/**
 * Main command palette navigation state atom
 *
 * @example
 * ```tsx
 * // Read state
 * const state = useAtomValue(commandPaletteAtom)
 *
 * // Update state (use hook-based setter for React components)
 * const setState = useAtomSet(commandPaletteAtom)
 * setState((prev) => ({ ...prev, currentPage: "channels" }))
 * ```
 */
export const commandPaletteAtom = Atom.make<CommandPaletteState>({
	currentPage: "home",
	pageHistory: [],
	inputValue: "",
}).pipe(Atom.keepAlive)

/**
 * Derived atom that checks if we can go back in navigation
 */
export const canGoBackAtom = Atom.make((get) => {
	const state = get(commandPaletteAtom)
	return state.pageHistory.length > 0
}).pipe(Atom.keepAlive)

/**
 * @deprecated Use useAtomSet(commandPaletteAtom) in React components instead.
 * Imperative atom updates don't trigger React re-renders properly.
 *
 * For non-React contexts only (e.g., keyboard shortcuts, external event handlers).
 */
export const resetCommandPaletteNavigation = () => {
	Atom.batch(() => {
		Atom.set(commandPaletteAtom, {
			currentPage: "home",
			pageHistory: [],
			inputValue: "",
		})
	})
}

/**
 * @deprecated Use useAtomSet(commandPaletteAtom) in React components instead.
 * Imperative atom updates don't trigger React re-renders properly.
 *
 * @example
 * ```tsx
 * // ❌ Don't do this in React components
 * navigateToPage("channels")
 *
 * // ✅ Do this instead
 * const setState = useAtomSet(commandPaletteAtom)
 * setState((state) => ({
 *   ...state,
 *   currentPage: "channels",
 *   pageHistory: [...state.pageHistory, state.currentPage],
 * }))
 * ```
 */
export const navigateToPage = (page: CommandPalettePage) => {
	Atom.batch(() => {
		Atom.update(commandPaletteAtom, (state) => ({
			...state,
			currentPage: page,
			pageHistory: [...state.pageHistory, state.currentPage],
			inputValue: "",
		}))
	})
}

/**
 * @deprecated Use useAtomSet(commandPaletteAtom) in React components instead.
 * Imperative atom updates don't trigger React re-renders properly.
 */
export const goBackInNavigation = () => {
	Atom.batch(() => {
		Atom.update(commandPaletteAtom, (state) => {
			if (state.pageHistory.length === 0) return state

			const previousPage = state.pageHistory[state.pageHistory.length - 1]
			return {
				...state,
				currentPage: previousPage || "home",
				pageHistory: state.pageHistory.slice(0, -1),
				inputValue: "",
			}
		})
	})
}

/**
 * @deprecated Use useAtomSet(commandPaletteAtom) in React components instead.
 * Imperative atom updates don't trigger React re-renders properly.
 */
export const updateSearchInput = (value: string) => {
	Atom.batch(() => {
		Atom.update(commandPaletteAtom, (state) => ({
			...state,
			inputValue: value,
		}))
	})
}
