import { createFileRoute, useElementScrollRestoration } from "@tanstack/solid-router"
import { type VirtualItem, createVirtualizer } from "@tanstack/solid-virtual"

import { type Accessor, For, type JSX, createEffect, createMemo, createSignal } from "solid-js"

export const Route = createFileRoute("/_protected/_app/$serverId/test")({
	component: RouteComponent,
})

type Item = {
	id: number
	value: string
}

const generateItems = (n: number) =>
	Array.from({ length: n }, (_, i): Item => ({ id: i, value: i.toString() }))

const getItemKey = (item: Item) => item.id

const estimateSize = () => 30

const count = 1000

const items = generateItems(count)

console.log(items)

function RouteComponent() {
	return (
		<div
			style={{
				flex: 1,
				padding: "5px",
				border: "1px solid red",
				display: "flex",
				"flex-direction": "column",
				height: "400px",
			}}
		>
			<VirtualList
				style={{
					flex: 1,
					height: 0,
					outline: "1px solid green",
					padding: "5px",
				}}
				items={() => items}
				getItemKey={getItemKey}
				estimateSize={estimateSize}
				overscan={10}
				renderItem={(item) => (
					<div
						style={{
							padding: "5px",
							border: "1px solid orange",
						}}
					>
						{item.value}
					</div>
				)}
			/>
		</div>
	)
}

export type VirtualListProps<T> = {
	class?: string
	style?: JSX.CSSProperties
	itemClass?: string
	itemStyle?: JSX.CSSProperties
	items: Accessor<T[]>
	getItemKey: (item: T, index: number) => string | number
	renderItem: (item: T, virtualItem: VirtualItem) => JSX.Element
	estimateSize: (index: number) => number
	overscan?: number
}

export function VirtualList<T>(props: VirtualListProps<T>): JSX.Element {
	let scrollableRef: HTMLDivElement | undefined

	const scrollRestorationId = "myVirtualizedContent"

	const scrollEntry = useElementScrollRestoration({
		id: scrollRestorationId,
	})

	const getItemKeyCallback = createMemo(() => {
		return (index: number) => props.getItemKey(props.items()[index]!, index)
	})

	const virtualizer = createVirtualizer({
		get count() {
			return props.items().length
		},
		getItemKey: getItemKeyCallback(),
		getScrollElement: () => scrollableRef as any,
		get estimateSize() {
			return props.estimateSize
		},
		get overscan() {
			return props.overscan
		},
		debug: true,
		initialOffset: scrollEntry?.scrollY,
	})

	createEffect(() => {
		props.items()
		virtualizer.scrollToIndex(props.items().length - 1)
	})

	return (
		<div
			style={{
				display: "flex",
				"flex-direction": "column-reverse",
				...props.style,
			}}
			data-scroll-restoration-id={scrollRestorationId}
		>
			<div
				ref={scrollableRef}
				style={{
					overflow: "auto",
				}}
			>
				<div
					style={{
						width: "100%",
						position: "relative",
						height: `${virtualizer.getTotalSize()}px`,
					}}
				>
					<div
						style={{
							position: "absolute",
							top: "0",
							left: "0",
							width: "100%",
							transform: `translateY(${virtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
						}}
					>
						<For each={virtualizer.getVirtualItems()}>
							{(virtualItem) => {
								const item = props.items()[virtualItem.index]!

								return (
									<div
										ref={virtualizer.measureElement}
										data-index={virtualItem.index}
										style={props.itemStyle}
									>
										{props.renderItem(item, virtualItem)}
									</div>
								)
							}}
						</For>
					</div>
				</div>
			</div>
		</div>
	)
}
