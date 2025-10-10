/**
 * TanStack DB utilities for Effect Atom
 * @since 1.0.0
 */

// Export all utilities
export {
	makeCollectionAtom,
	makeQuery,
	makeQueryConditional,
	makeQueryUnsafe,
	makeSingleCollectionAtom,
} from "./AtomTanStackDB"

// Export types
export type {
	CollectionStatus,
	ConditionalQueryFn,
	InferCollectionResult,
	QueryFn,
	QueryOptions,
	TanStackDBError,
	UnsubscribeFn,
} from "./types"
