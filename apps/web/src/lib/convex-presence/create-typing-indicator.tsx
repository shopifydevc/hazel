import { createEffect, createSignal, onCleanup } from "solid-js"
import type { Accessor } from "solid-js"

export const createTypingIndicator = (
	currentTyping: Accessor<boolean>,
	text: Accessor<string>,
	updateMyPresence: (p: { typing?: boolean }) => void,
) => {
	let timer: NodeJS.Timeout | null = null
	const [previousText, setPreviousText] = createSignal("")

	// Clear timer on component cleanup
	onCleanup(() => {
		if (timer) clearTimeout(timer)
	})

	createEffect(() => {
		if (timer) {
			clearTimeout(timer)
			timer = null
		}

		const currentText = text()
		const prevText = previousText()

		if (currentTyping() || prevText === currentText) {
			timer = setTimeout(() => updateMyPresence({ typing: false }), 1000)
			return
		}

		setPreviousText(currentText)
		updateMyPresence({ typing: true })
		timer = setTimeout(() => updateMyPresence({ typing: false }), 1000)
	})
}
