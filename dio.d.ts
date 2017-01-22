// Enums
declare enum nodeType {
	Empty = 0,
	Element = 1,
	Component = 2,
	Text = 3,
	Fragment = 11
}

// Types
type Key = string | number;
type Ref = string | Function;
type Children = Array<VNode>;
type Type = string | Function;
type State = Object;
type createElement = (type: Type, props?: Props, ...children: Array<any>) => VNode;
type streamCatch = (reason: any) => stream;
type streamThen = (data: any) => stream;
type Reducer = (currentState: State, action: Action) => any;
type Events = EventObject | EventCallback;
type RenderTypes = VNode | any[] | string | number | null | void;

// Shapes
interface EventCallback {
	(e: Event): any;
}

interface EventBindCallback {
	(data: any, e: Event): any;
}

interface EventBindObject {
	this?: any;
	property?: any;
}

interface EventObject {
	bind?: EventBindCallback | EventBindObject;
	with?: any;
	
	handler?: EventBindCallback | EventBindObject;
	data?: any;

	options?: boolean | Object;
	preventDefault?: boolean;
}

interface Action {
	type: any;
}

interface EventProps {
	onabort?: Events;
	onauxclick?: Events;
	onbeforecopy?: Events;
	onbeforecut?: Events;
	onbeforepaste?: Events;
	onblur?: Events;
	oncancel?: Events;
	oncanplay?: Events;
	oncanplaythrough?: Events;
	onchange?: Events;
	onclick?: Events;
	onclose?: Events;
	oncontextmenu?: Events;
	oncopy?: Events;
	oncuechange?: Events;
	oncut?: Events;
	ondblclick?: Events;
	ondrag?: Events;
	ondragend?: Events;
	ondragenter?: Events;
	ondragleave?: Events;
	ondragover?: Events;
	ondragstart?: Events;
	ondrop?: Events;
	ondurationchange?: Events;
	onemptied?: Events;
	onended?: Events;
	onerror?: Events;
	onfocus?: Events;
	ongotpointercapture?: Events;
	oninput?: Events;
	oninvalid?: Events;
	onkeydown?: Events;
	onkeypress?: Events;
	onkeyup?: Events;
	onload?: Events;
	onloadeddata?: Events;
	onloadedmetadata?: Events;
	onloadstart?: Events;
	onlostpointercapture?: Events;
	onmousedown?: Events;
	onmouseenter?: Events;
	onmouseleave?: Events;
	onmousemove?: Events;
	onmouseout?: Events;
	onmouseover?: Events;
	onmouseup?: Events;
	onmousewheel?: Events;
	onpaste?: Events;
	onpause?: Events;
	onplay?: Events;
	onplaying?: Events;
	onpointercancel?: Events;
	onpointerdown?: Events;
	onpointerenter?: Events;
	onpointerleave?: Events;
	onpointermove?: Events;
	onpointerout?: Events;
	onpointerover?: Events;
	onpointerup?: Events;
	onprogress?: Events;
	onratechange?: Events;
	onreset?: Events;
	onresize?: Events;
	onscroll?: Events;
	onsearch?: Events;
	onseeked?: Events;
	onseeking?: Events;
	onselect?: Events;
	onselectstart?: Events;
	onshow?: Events;
	onstalled?: Events;
	onsubmit?: Events;
	onsuspend?: Events;
	ontimeupdate?: Events;
	ontoggle?: Events;
	onvolumechange?: Events;
	onwaiting?: Events;
	onwebkitfullscreenchange?: Events;
	onwebkitfullscreenerror?: Events;
	onwheel?: Events;

	onAbort?: Events;
	onAuxClick?: Events;
	onBeforeCopy?: Events;
	onBeforeCut?: Events;
	onBeforePaste?: Events;
	onBlur?: Events;
	onCancel?: Events;
	onCanPlay?: Events;
	onCanPlayThrough?: Events;
	onChange?: Events;
	onClick?: Events;
	onClose?: Events;
	onContextMenu?: Events;
	onCopy?: Events;
	onCueChange?: Events;
	onCut?: Events;
	onDblClick?: Events;
	onDrag?: Events;
	onDragEnd?: Events;
	onDragEnter?: Events;
	onDragLeave?: Events;
	onDragOver?: Events;
	onDragStart?: Events;
	onDrop?: Events;
	onDurationChange?: Events;
	onEmptied?: Events;
	onEnded?: Events;
	onError?: Events;
	onFocus?: Events;
	onGotPointerCapture?: Events;
	onInput?: Events;
	onInvalid?: Events;
	onKeydown?: Events;
	onKeypress?: Events;
	onKeyup?: Events;
	onLoad?: Events;
	onLoadedData?: Events;
	onLoadedMetaData?: Events;
	onLoadStart?: Events;
	onLostPointerCapture?: Events;
	onMouseDown?: Events;
	onMouseEnter?: Events;
	onMouseLeave?: Events;
	onMouseMove?: Events;
	onMouseOut?: Events;
	onMouseOver?: Events;
	onMouseUp?: Events;
	onMouseWheel?: Events;
	onPaste?: Events;
	onPause?: Events;
	onPlay?: Events;
	onPlaying?: Events;
	onPointerCancel?: Events;
	onPointerDown?: Events;
	onPointerEnter?: Events;
	onPointerLeave?: Events;
	onPointerMove?: Events;
	onPointerOut?: Events;
	onPointerOver?: Events;
	onPointerUp?: Events;
	onProgress?: Events;
	onRateChange?: Events;
	onReset?: Events;
	onResize?: Events;
	onScroll?: Events;
	onSearch?: Events;
	onSeeked?: Events;
	onSeeking?: Events;
	onSelect?: Events;
	onSelectStart?: Events;
	onShow?: Events;
	onStalled?: Events;
	onSubmit?: Events;
	onSuspend?: Events;
	onTimeUpdate?: Events;
	onToggle?: Events;
	onVolumeChange?: Events;
	onWaiting?: Events;
	onWebkitFullScreenChange?: Events;
	onWebkitFullScreenError?: Events;
	onWheel?: Events;
}

interface Props extends EventProps {
	children?: Children;
	ref?: Ref;
	key?: Key;
	className?: any;
	class?: any;
	id?: any;
	checked?: any;
	value?: any;
	style?: any;
	href?: any;
}

interface VNode {
	nodeType: nodeType;
	type: Type;
	props: Props;
	children: Children;
	DOMNode: Node | null;
	instance: Object | null;
	index: number | null;
	parent: VNode | null;
	key: any;
}

interface VText extends VNode {
	nodeType: nodeType.Text;
}

interface VComponent extends VNode {
	nodeType: nodeType.Component;
}

interface VElement extends VNode {
	nodeType: nodeType.Element;
}

interface VFragment extends VNode {
	nodeType: nodeType.Fragment;
}

interface Request {
	url: string;
	method?: string;
	payload?: string | Object;
	enctype?: string;
	responseType?: string;
	withCredentials?: boolean;
	headers?: Object;
	initial?: Object;
	config?: (xhr: XMLHttpRequest) => void;
	username?: string;
	password?: string;
}

interface Store {
	getState: () => State;
	dispatch: (action: Action) => any;
	subscribe: (listener: (state: State) => any) => (listener: string) => any;
	connect: (subject: any, element?: Node) => any;
	replaceReducer: (listener: string) => any
}

interface Stream {
	end: (data: any) => any;
	pipe: (destination: Stream) => any;
	on: (event: string, callback: (data?: any) => any) => any;
}

interface stream {
	(value?: any): stream;
	then: streamThen;
	catch: streamCatch;
	done: (success: streamThen, error?: streamCatch) => stream;
	end: (value?: any) => void;
	map: (callback: (stream: stream) => any) => stream;
	resolve: (value?: any) => stream;
	reject: (reason?: any) => stream;
}

interface Router {
	navigate: Function;
	back: Function | null;
	forward: Function | null;
	link: (to: string | Function) => any
	resume: () => void;
	pause: () => void;
	destroy: () => void;
	set: (route: string, callback: Function) => void;
	resolve: (url: string) => void;

	readonly routes: Object;
	readonly location: string;
}

// Namespaces
declare namespace dio {
	export const version: string;

	// Components
	export abstract class Component<P> {
		constructor (props: P);
		forceUpdate (callback?: () => any): void;
		setState (state: State, callback?: () => any): void;
		state: State;
		props: Object;
		refs: Object | null;
	}
	export function createClass (shape: Object | Function): Function;

	// Elements 
	export const createElement: createElement;
	export const h: createElement;
	export function cloneElement (element: VNode, props?: Object, children?: Array<any>): VNode;
	export function isValidElement (subject: any): boolean;
	export function createFactory (type: Type, props?: Object): createElement;
	export function DOM (types: Array<string>): Object;

	// Shapes
	export function VElement (type: Type, props?: Props, children?: Children): VNode;
	export function VComponent (type: Function, props?: Props, children?: Children): VNode;
	export function VText (children: string | number): VNode;
	export function VSvg (type: Type, props?: Props, children?: Children): VNode;

	// Render
	export function render (
		subject: VNode | Object | Function, 
		target?: string | Node, 
		callback?: (DOMNode: Element) => void,
		hydration?: boolean
	): (props?: Object) => void; 

	// Test Utils
	export function shallow (subject: VNode | Object | Function): VNode;

	// HTTP
	export const request: {
		(url: string | Request, payload?: string | Object, enctype?: string, responseType?: string): stream;
		get: (url: string, payload?: string | Object, enctype?: string, responseType?: string) => stream;
		post: (url: string, payload?: string | Object, enctype?: string, responseType?: string) => stream;
	}

	// Store
	export function applyMiddleware (...functions: Array<Function>): (store: Store) => () => Store;
	export function createStore (reducer: Object | Reducer, initialState?: State): Store;
	export function combineReducers (reducers: Object): (state: State, action: Action) => any;

	// Server
	export function renderToString (subject: VNode | Array<any> | Function, template?: string | Function): string;
	export function renderToStream (subject: VNode | Array<any> | Function, template?: string): Stream;
	export function renderToCache (subject: VNode | Array<any> | Function): VNode | Children | Array<any>;

	// Stream
	export const stream: stream;

	// Router
	export function router (
		routes: Object, 
		address?: string | Object, 
		initialiser?: string, 
		element?: string | Node, 
		middleware?: Function, 
		notFound?: Function
	): Router;
}

declare const h: createElement;
declare module 'dio' { export = dio; }

