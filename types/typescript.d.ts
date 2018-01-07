// types
type Text = string|number|null|void
type Key = Text
type Ref = string|Function
type Fragment = symbol
type Type = string|Function|Promise<any>|ElementNode|Fragment
type State = object
type Renderable = ElementNode|Text|Promise<any>|Array<any>|Function

interface Link {
	next: Link
	prev: Link
}

interface List {
	next: Link
	prev: Link
	length: number
}

interface Refs {
	[key: string]: any
}

interface createElement {
	(type: Type, props?: Props|Renderable, ...children: Array<Renderable>): ElementNode
}

interface ErrorInfo {
	stack: string
	message: string
	errorLocation: string
	errorStack: string
	errorMessage: string
	componentStack: string
	defaultPrevented: boolean
	preventDefault: () => void
	inspect: () => string
}

interface EventHandler {
	(e: Event, props: object, state: object, context: object): any
}

interface EventListener {
	handleEvent: EventHandler
}

interface Events {
	onabort?: EventListener|EventHandler
	onauxclick?: EventListener|EventHandler
	onbeforecopy?: EventListener|EventHandler
	onbeforecut?: EventListener|EventHandler
	onbeforepaste?: EventListener|EventHandler
	onblur?: EventListener|EventHandler
	oncancel?: EventListener|EventHandler
	oncanplay?: EventListener|EventHandler
	oncanplaythrough?: EventListener|EventHandler
	onchange?: EventListener|EventHandler
	onclick?: EventListener|EventHandler
	onclose?: EventListener|EventHandler
	oncontextmenu?: EventListener|EventHandler
	oncopy?: EventListener|EventHandler
	oncuechange?: EventListener|EventHandler
	oncut?: EventListener|EventHandler
	ondblclick?: EventListener|EventHandler
	ondrag?: EventListener|EventHandler
	ondragend?: EventListener|EventHandler
	ondragenter?: EventListener|EventHandler
	ondragleave?: EventListener|EventHandler
	ondragover?: EventListener|EventHandler
	ondragstart?: EventListener|EventHandler
	ondrop?: EventListener|EventHandler
	ondurationchange?: EventListener|EventHandler
	onemptied?: EventListener|EventHandler
	onended?: EventListener|EventHandler
	onerror?: EventListener|EventHandler
	onfocus?: EventListener|EventHandler
	ongotpointercapture?: EventListener|EventHandler
	oninput?: EventListener|EventHandler
	oninvalid?: EventListener|EventHandler
	onkeydown?: EventListener|EventHandler
	onkeypress?: EventListener|EventHandler
	onkeyup?: EventListener|EventHandler
	onload?: EventListener|EventHandler
	onloadeddata?: EventListener|EventHandler
	onloadedmetadata?: EventListener|EventHandler
	onloadstart?: EventListener|EventHandler
	onlostpointercapture?: EventListener|EventHandler
	onmousedown?: EventListener|EventHandler
	onmouseenter?: EventListener|EventHandler
	onmouseleave?: EventListener|EventHandler
	onmousemove?: EventListener|EventHandler
	onmouseout?: EventListener|EventHandler
	onmouseover?: EventListener|EventHandler
	onmouseup?: EventListener|EventHandler
	onmousewheel?: EventListener|EventHandler
	onpaste?: EventListener|EventHandler
	onpause?: EventListener|EventHandler
	onplay?: EventListener|EventHandler
	onplaying?: EventListener|EventHandler
	onpointercancel?: EventListener|EventHandler
	onpointerdown?: EventListener|EventHandler
	onpointerenter?: EventListener|EventHandler
	onpointerleave?: EventListener|EventHandler
	onpointermove?: EventListener|EventHandler
	onpointerout?: EventListener|EventHandler
	onpointerover?: EventListener|EventHandler
	onpointerup?: EventListener|EventHandler
	onprogress?: EventListener|EventHandler
	onratechange?: EventListener|EventHandler
	onreset?: EventListener|EventHandler
	onresize?: EventListener|EventHandler
	onscroll?: EventListener|EventHandler
	onsearch?: EventListener|EventHandler
	onseeked?: EventListener|EventHandler
	onseeking?: EventListener|EventHandler
	onselect?: EventListener|EventHandler
	onselectstart?: EventListener|EventHandler
	onshow?: EventListener|EventHandler
	onstalled?: EventListener|EventHandler
	onsubmit?: EventListener|EventHandler
	onsuspend?: EventListener|EventHandler
	ontimeupdate?: EventListener|EventHandler
	ontoggle?: EventListener|EventHandler
	onvolumechange?: EventListener|EventHandler
	onwaiting?: EventListener|EventHandler
	onwebkitfullscreenchange?: EventListener|EventHandler
	onwebkitfullscreenerror?: EventListener|EventHandler
	onwheel?: EventListener|EventHandler

	onAbort?: EventListener|EventHandler
	onAuxClick?: EventListener|EventHandler
	onBeforeCopy?: EventListener|EventHandler
	onBeforeCut?: EventListener|EventHandler
	onBeforePaste?: EventListener|EventHandler
	onBlur?: EventListener|EventHandler
	onCancel?: EventListener|EventHandler
	onCanPlay?: EventListener|EventHandler
	onCanPlayThrough?: EventListener|EventHandler
	onChange?: EventListener|EventHandler
	onClick?: EventListener|EventHandler
	onClose?: EventListener|EventHandler
	onContextMenu?: EventListener|EventHandler
	onCopy?: EventListener|EventHandler
	onCueChange?: EventListener|EventHandler
	onCut?: EventListener|EventHandler
	onDblClick?: EventListener|EventHandler
	onDrag?: EventListener|EventHandler
	onDragEnd?: EventListener|EventHandler
	onDragEnter?: EventListener|EventHandler
	onDragLeave?: EventListener|EventHandler
	onDragOver?: EventListener|EventHandler
	onDragStart?: EventListener|EventHandler
	onDrop?: EventListener|EventHandler
	onDurationChange?: EventListener|EventHandler
	onEmptied?: EventListener|EventHandler
	onEnded?: EventListener|EventHandler
	onError?: EventListener|EventHandler
	onFocus?: EventListener|EventHandler
	onGotPointerCapture?: EventListener|EventHandler
	onInput?: EventListener|EventHandler
	onInvalid?: EventListener|EventHandler
	onKeydown?: EventListener|EventHandler
	onKeypress?: EventListener|EventHandler
	onKeyup?: EventListener|EventHandler
	onLoad?: EventListener|EventHandler
	onLoadedData?: EventListener|EventHandler
	onLoadedMetaData?: EventListener|EventHandler
	onLoadStart?: EventListener|EventHandler
	onLostPointerCapture?: EventListener|EventHandler
	onMouseDown?: EventListener|EventHandler
	onMouseEnter?: EventListener|EventHandler
	onMouseLeave?: EventListener|EventHandler
	onMouseMove?: EventListener|EventHandler
	onMouseOut?: EventListener|EventHandler
	onMouseOver?: EventListener|EventHandler
	onMouseUp?: EventListener|EventHandler
	onMouseWheel?: EventListener|EventHandler
	onPaste?: EventListener|EventHandler
	onPause?: EventListener|EventHandler
	onPlay?: EventListener|EventHandler
	onPlaying?: EventListener|EventHandler
	onPointerCancel?: EventListener|EventHandler
	onPointerDown?: EventListener|EventHandler
	onPointerEnter?: EventListener|EventHandler
	onPointerLeave?: EventListener|EventHandler
	onPointerMove?: EventListener|EventHandler
	onPointerOut?: EventListener|EventHandler
	onPointerOver?: EventListener|EventHandler
	onPointerUp?: EventListener|EventHandler
	onProgress?: EventListener|EventHandler
	onRateChange?: EventListener|EventHandler
	onReset?: EventListener|EventHandler
	onResize?: EventListener|EventHandler
	onScroll?: EventListener|EventHandler
	onSearch?: EventListener|EventHandler
	onSeeked?: EventListener|EventHandler
	onSeeking?: EventListener|EventHandler
	onSelect?: EventListener|EventHandler
	onSelectStart?: EventListener|EventHandler
	onShow?: EventListener|EventHandler
	onStalled?: EventListener|EventHandler
	onSubmit?: EventListener|EventHandler
	onSuspend?: EventListener|EventHandler
	onTimeUpdate?: EventListener|EventHandler
	onToggle?: EventListener|EventHandler
	onVolumeChange?: EventListener|EventHandler
	onWaiting?: EventListener|EventHandler
	onWebkitFullScreenChange?: EventListener|EventHandler
	onWebkitFullScreenError?: EventListener|EventHandler
	onWheel?: EventListener|EventHandler
}

interface Props extends Events {
	children?: any
	ref?: Ref
	key?: Key
	className?: Text
	class?: Text
	id?: Text
	checked?: boolean
	value?: Text
	style?: string|object
	href?: Text
	width?: Text
	height?: Text
	defaultValue?: Text
	tabIndex?: number
	tabindex?: number
	hidden?: boolean
	dangerouslySetInnerHTML?: {__html: any}
	innerHTML?: any
}

interface ElementNode extends Link {
	id: number
	work: number
	active: boolean
	xmlns: string
	key: Key
	ref: Ref
	type: Type
	props: Props
	state: any
	children: List
	owner: any
	instance: any
	event: any
	DOM: any
	context: any
	parent: any
	host: any
	handlEvent: (e: Event) => void
	toString: () => string
}

interface isValidElement {
	(element: any): boolean
}

interface findDOMNode {
	(component: any): Node
}

interface unmountComponentAtNode {
	(node: object): boolean
}

interface Children {
	forEach: (children: any, callback: Function, thisArg: any) => void
	map: (children: any, callback: Function, thisArg: any) => Array<any>
	toArray: (children: any) => Array<any>
	count: (children: any) => number
	only: (children: ElementNode) => ElementNode
}

interface render {
	(element: any, container?: object, callback?: Function): void
}

interface hydrate {
	(element: any, container?: object, callback?: Function): void
}

interface renderToString {
	(element: any, container?: object, callback?: Function): void
}

interface renderToNodeStream {
	(element: any, container?: object, callback?: Function): void
}

interface createFactory {
	(type: ElementNode|Function|string|object): Function|object
}

interface createPortal {
	(element: ElementNode, container: Node, key: any): ElementNode
}

interface cloneElement {
	(element: ElementNode, props?: Props|Renderable, ...children: Array<Renderable>): ElementNode
}

interface AbstractComponent<P, S> {
	defaultProps?: Partial<P>
	displayName?: string

	getChildContext(props: P, state: S, context: object): object
	getInitialState(props: P): S

	componentDidCatch(error: Error, info: ErrorInfo): any

	componentWillReceiveProps(nextProps: P, nextContext: object): any
	shouldComponentUpdate(nextProps: P, nextState: S): boolean
	componentWillUpdate(nextProps: P, nextState: S): any
	componentDidUpdate(prevProps: P, prevState: S): any
	componentWillMount(): any
	componentDidMount(node: Node): any
	componentWillUnmount(node: Node): any
}

declare abstract class AbstractComponent<P, S> {
	state: Readonly<S>
	props: Readonly<P>
	context: Object
	refs: Refs
	constructor (props?: Readonly<P>)

	render(props?: Readonly<P>, state?: Readonly<S>): Renderable

	forceUpdate (callback?: () => any): void
	setState<K extends keyof S>(state: (prevState: Readonly<S>, props: P) => Pick<S, K>, callback?: () => any): void
	setState<K extends keyof S>(state: Pick<S, K>, callback?: () => any): void
}

declare global {
	namespace dio {
		export const version: string
		export const h: createElement
		export const createElement: createElement
		export const isValidElement: isValidElement
		export const findDOMNode: findDOMNode
		export const Children: Children
		export const unmountComponentAtNode: unmountComponentAtNode
		export const Fragment: Fragment
		export const cloneElement: cloneElement
		export const createPortal: createPortal
		export const createFactory: createFactory

		export const render: render
		export const renderToString: renderToString
		export const renderToNodeStream: renderToNodeStream

		export abstract class Component<P = {}, S = {}> extends AbstractComponent<P, S> {}
		export abstract class PureComponent<P = {}, S = {}> extends AbstractComponent<P, S> {}
	}

	namespace JSX {
		interface Element extends ElementNode {}
		interface ElementClass extends AbstractComponent<P, S> {}
		interface ElementAttributesProperty {props: any}
		interface ElementChildrenAttribute {children: any}
		interface IntrinsicAttributes extends Props {}
		interface IntrinsicClassAttributes extends Props {}
		interface IntrinsicElements {[props: string]: any}
	}
}

export = dio
