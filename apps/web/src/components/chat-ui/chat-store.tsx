import { type JSX, createContext, useContext } from "solid-js"
import { createStore } from "solid-js/store"

interface ChatStore {
	replyToMessageId: string | null
	openThreadId: string | null
}

const createChatStore = () => {
	const [state, setState] = createStore<ChatStore>({
		replyToMessageId: null as string | null,
		openThreadId: null as string | null,
	})

	function set<K extends keyof ChatStore>(key: K, value: ChatStore[K]) {
		setState(key, value)
	}

	return {
		state,
		set,
	}
}

export const ChatContext = createContext<ReturnType<typeof createChatStore> | undefined>()

export const ChatProvider = (props: { children: JSX.Element }) => {
	const chatStore$ = createChatStore()

	return <ChatContext.Provider value={chatStore$}>{props.children}</ChatContext.Provider>
}

export const useChat = () => {
	const context = useContext(ChatContext)

	if (!context) {
		throw new Error("useChat must be used within a ChatProvider")
	}

	return context
}
