import type { AIContentChunk } from "@hazel/bot-sdk"
import type { TextStreamPart } from "ai"

export interface VercelStreamState {
	hasActiveReasoning: boolean
}

export const mapVercelPartToChunk = (
	part: TextStreamPart<any>,
	state: VercelStreamState,
): AIContentChunk | null => {
	switch (part.type) {
		case "text-delta":
			return { type: "text", text: part.text }

		case "reasoning-delta":
			state.hasActiveReasoning = true
			return { type: "thinking", text: part.text, isComplete: false }

		case "reasoning-end":
			state.hasActiveReasoning = false
			return { type: "thinking", text: "", isComplete: true }

		case "tool-call":
			return {
				type: "tool_call",
				id: part.toolCallId,
				name: part.toolName,
				input: part.input as Record<string, unknown>,
			}

		case "tool-result":
			return {
				type: "tool_result",
				toolCallId: part.toolCallId,
				output: part.output,
			}

		case "tool-error":
			return {
				type: "tool_result",
				toolCallId: part.toolCallId,
				output: null,
				error: String(part.error),
			}

		case "tool-output-denied":
			return {
				type: "tool_result",
				toolCallId: part.toolCallId,
				output: null,
				error: "Tool execution denied",
			}

		case "start":
		case "start-step":
		case "text-start":
		case "text-end":
		case "reasoning-start":
		case "tool-input-start":
		case "tool-input-delta":
		case "tool-input-end":
		case "finish-step":
		case "finish":
		case "abort":
		case "source":
		case "file":
		case "error":
		case "raw":
			return null

		default:
			return null
	}
}
