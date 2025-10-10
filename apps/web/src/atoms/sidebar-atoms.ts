import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Atom } from "@effect-atom/atom-react"
import { Schema } from "effect"

/**
 * Sidebar state type
 */
export type SidebarState = "expanded" | "collapsed"

/**
 * localStorage runtime for sidebar persistence
 */
const localStorageRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage)

/**
 * Atom that stores whether the sidebar is open (desktop)
 * Persisted to localStorage as "sidebar_state" for backwards compatibility
 */
export const sidebarOpenAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "sidebar_state",
	schema: Schema.NullOr(Schema.Boolean),
	defaultValue: () => true,
})

/**
 * Atom that stores whether the mobile sidebar is open
 * Not persisted, resets on page load
 */
export const sidebarOpenMobileAtom = Atom.make<boolean>(false).pipe(Atom.keepAlive)

/**
 * Derived atom that returns the sidebar state ("expanded" or "collapsed")
 */
export const sidebarStateAtom = Atom.make((get) => {
	const isOpen = get(sidebarOpenAtom)
	return isOpen ? ("expanded" as const) : ("collapsed" as const)
}).pipe(Atom.keepAlive)

/**
 * Helper function to toggle the desktop sidebar
 */
export const toggleSidebar = () => {
	Atom.batch(() => {
		Atom.update(sidebarOpenAtom, (open) => !open)
	})
}

/**
 * Helper function to toggle the mobile sidebar
 */
export const toggleMobileSidebar = () => {
	Atom.batch(() => {
		Atom.update(sidebarOpenMobileAtom, (open) => !open)
	})
}

/**
 * Helper function to set the sidebar state
 */
export const setSidebarOpen = (open: boolean) => {
	Atom.batch(() => {
		Atom.set(sidebarOpenAtom, open)
	})
}

/**
 * Helper function to set the mobile sidebar state
 */
export const setMobileSidebarOpen = (open: boolean) => {
	Atom.batch(() => {
		Atom.set(sidebarOpenMobileAtom, open)
	})
}
