import { BrowserKeyValueStore } from "@effect/platform-browser"
import { Atom, useAtomSet, useAtomValue } from "@effect-atom/atom-react"
import { Schema } from "effect"
import { useEffect } from "react"
import { generateRgbShades } from "./application/modals/base-components/generate-shades"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
	children: React.ReactNode
	defaultTheme?: Theme
	storageKey?: string
}

// Predefined color swatches for brand color
const colorSwatches = [
	{ hex: "#535862", name: "gray" },
	{ hex: "#099250", name: "green" },
	{ hex: "#1570EF", name: "blue" },
	{ hex: "#444CE7", name: "indigo" },
	{ hex: "#6938EF", name: "purple" },
	{ hex: "#BA24D5", name: "fuchsia" },
	{ hex: "#DD2590", name: "pink" },
	{ hex: "#E04F16", name: "orange" },
]

// Schema for theme validation
const ThemeSchema = Schema.Literal("dark", "light", "system")

// Schema for brand color hex string validation
const HexColorSchema = Schema.String.pipe(
	Schema.pattern(/^#[0-9A-Fa-f]{6}$/),
	Schema.annotations({ message: () => "Must be a valid hex color (#RRGGBB)" }),
)

// localStorage runtime for theme persistence
const localStorageRuntime = Atom.runtime(BrowserKeyValueStore.layerLocalStorage)

// Theme atom with automatic localStorage persistence
export const themeAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "hazel-ui-theme",
	schema: Schema.NullOr(ThemeSchema),
	defaultValue: () => "system" as const,
})

// Brand color atom with automatic localStorage persistence
export const brandColorAtom = Atom.kvs({
	runtime: localStorageRuntime,
	key: "brand-color",
	schema: Schema.NullOr(HexColorSchema),
	defaultValue: () => "#7F56D9" as const,
})

// Derived atom that resolves "system" to actual theme
export const resolvedThemeAtom = Atom.make((get) => {
	const theme = get(themeAtom)
	if (theme === "system") {
		// Check system preference
		if (typeof window !== "undefined") {
			return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
		}
		return "light"
	}
	return theme || "system"
})

export function ThemeProvider({ children }: ThemeProviderProps) {
	const resolvedTheme = useAtomValue(resolvedThemeAtom)
	const brandColor = useAtomValue(brandColorAtom)

	// Apply theme class to document root
	useEffect(() => {
		const root = window.document.documentElement

		root.classList.remove("light", "dark")
		root.classList.add(resolvedTheme)
	}, [resolvedTheme])

	// Apply brand color CSS variables to document root
	useEffect(() => {
		const hexColor = brandColor || "#7F56D9"

		// Check if color matches a predefined swatch
		const existingColorSwatch = colorSwatches.find((swatch) => swatch.hex === hexColor)

		if (existingColorSwatch) {
			const shades = ["25", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]

			// Re-map the brand color variables to the existing primitive color variables
			shades.forEach((shade) => {
				document.documentElement.style.setProperty(
					`--color-brand-${shade}`,
					`var(--color-${existingColorSwatch.name}-${shade})`,
				)
			})

			return
		}

		// Generate custom color shades for non-swatch colors
		const shades = generateRgbShades(hexColor)
		if (!shades) return

		// Set the brand color variables to the new custom color shades
		Object.entries(shades).forEach(([key, { r, g, b }]) => {
			document.documentElement.style.setProperty(`--color-brand-${key}`, `rgb(${r} ${g} ${b})`)
		})
	}, [brandColor])

	return <>{children}</>
}

export const useTheme = () => {
	const theme = useAtomValue(themeAtom)
	const setTheme = useAtomSet(themeAtom)
	const brandColor = useAtomValue(brandColorAtom)
	const setBrandColor = useAtomSet(brandColorAtom)

	return {
		theme: theme || "system",
		setTheme,
		brandColor: brandColor || "#7F56D9",
		setBrandColor,
	}
}
