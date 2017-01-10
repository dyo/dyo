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

interface ComponentDefaults {
	render: (props: Props, state: State, context: this) => VNode | null | void;
}

interface Action {
	type: any;
}

interface Props {
	children?: Children;
	ref?: Ref;
	key?: Key;
	className?: any;
	class?: any;
	id?: any;
	checked?: any;
	value?: any;
	style?: string | Object;

	onClick?: Events;
	onChange?: Events;
	onDblClick?: Events;
	onFocus?: Events;
	onKeyUp?: Events;
	onKeyDown?: Events;
	onLoad?: Events;
	onMouseDown?: Events;
	onMouseEnter?: Events;
	onMouseLeave?: Events;
	onMouseMove?: Events;
	onMouseOut?: Events;
	onMouseOver?: Events;
	onMouseUp?: Events;
	onMouseWheel?: Events;
	onSubmit?: Events;
	onSelect?: Events;
	onSelectStart?: Events;
	onInput?: Events;
	onError?: Events;
	onBlur?: Events;
	onDrag?: Events;
	onDragEnd?: Events;
	onDragEnter?: Events;
	onDragLeave?: Events;
	onDragOver?: Events;
	onDragStart?: Events;
	onDrop?: Events;
	onToggle?: Events;
	onKeyPress?: Events;
	onTouchEnd?: Events;
	onTouchStart?: Events;
	onTouchMove?: Events;
	onTouchCancel?: Events;
	onScroll?: Events;
	onReset?: Events;
	onPlay?: Events;
	onPlaying?: Events;
	onPause?: Events;
	onContextMenu?: Events;
	onCopy?: Events;
	onCut?: Events;

	onclick?: Events;
	onchange?: Events;
	ondblclick?: Events;
	onfocus?: Events;
	onkeyup?: Events;
	onkeydown?: Events;
	onload?: Events;
	onmousedown?: Events;
	onmouseenter?: Events;
	onmouseleave?: Events;
	onmousemove?: Events;
	onmouseout?: Events;
	onmouseover?: Events;
	onmouseup?: Events;
	onmousewheel?: Events;
	onsubmit?: Events;
	onselect?: Events;
	onselectstart?: Events;
	oninput?: Events;
	onerror?: Events;
	onblur?: Events;
	ondrag?: Events;
	ondragend?: Events;
	ondragenter?: Events;
	ondragleave?: Events;
	ondragover?: Events;
	ondragstart?: Events;
	ondrop?: Events;
	ontoggle?: Events;
	onkeypress?: Events;
	ontouchend?: Events;
	ontouchstart?: Events;
	ontouchmove?: Events;
	ontouchcancel?: Events;
	onscroll?: Events;
	onreset?: Events;
	onplay?: Events;
	onplaying?: Events;
	onpause?: Events;
	oncontextmenu?: Events;
	oncopy?: Events;
	oncut?: Events;
}

interface VNode {
	nodeType: nodeType;
	type: Type;
	props: Props;
	children: Children;
	DOMNode: Node;
	instance: Object | null;
	index: number
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
	export abstract class Component<Props> {
		constructor (props: Props);
		forceUpdate (callback?: () => void): void;
		setState (state: Object, callback?: () => void): void;
		state: State;
		props: Props;
		VNode: VNode | null;
		refs: Object | null;
	}
	export function createClass (shape: Function | ComponentDefaults): Function;

	// Elements 
	export const createElement: createElement;
	export const h: createElement;
	export function cloneElement (element: VNode, props?: Props, children?: Array<any>): VNode;
	export function isValidElement (subject: any): boolean;
	export function createFactory (type: Type, props?: Props): createElement;
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
	): (props: Props) => any; 

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

