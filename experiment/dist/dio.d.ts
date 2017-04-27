// Enums
declare enum Flags {
	Text = 1,
	Element = 2,
	Error = 3
}

declare enum Async {
	Ready = 0,
	Blocked = 1,
	Pending = 2
}

declare enum Groups {
	Element = 0,
	Function = 1,
	Class = 2
}

// Types
type Key = string | number;
type Ref = string | Function;
type Children = Array<Tree>;
type Type = string | Function;
type State = Object;
type createElement = (type?: Type, props?: Props, ...children: Array<any>) => Tree;

// Shapes
interface Event {
	(props: Props, state: State, e: Event): any;
}

interface Events {
	onabort?: Event;
	onauxclick?: Event;
	onbeforecopy?: Event;
	onbeforecut?: Event;
	onbeforepaste?: Event;
	onblur?: Event;
	oncancel?: Event;
	oncanplay?: Event;
	oncanplaythrough?: Event;
	onchange?: Event;
	onclick?: Event;
	onclose?: Event;
	oncontextmenu?: Event;
	oncopy?: Event;
	oncuechange?: Event;
	oncut?: Event;
	ondblclick?: Event;
	ondrag?: Event;
	ondragend?: Event;
	ondragenter?: Event;
	ondragleave?: Event;
	ondragover?: Event;
	ondragstart?: Event;
	ondrop?: Event;
	ondurationchange?: Event;
	onemptied?: Event;
	onended?: Event;
	onerror?: Event;
	onfocus?: Event;
	ongotpointercapture?: Event;
	oninput?: Event;
	oninvalid?: Event;
	onkeydown?: Event;
	onkeypress?: Event;
	onkeyup?: Event;
	onload?: Event;
	onloadeddata?: Event;
	onloadedmetadata?: Event;
	onloadstart?: Event;
	onlostpointercapture?: Event;
	onmousedown?: Event;
	onmouseenter?: Event;
	onmouseleave?: Event;
	onmousemove?: Event;
	onmouseout?: Event;
	onmouseover?: Event;
	onmouseup?: Event;
	onmousewheel?: Event;
	onpaste?: Event;
	onpause?: Event;
	onplay?: Event;
	onplaying?: Event;
	onpointercancel?: Event;
	onpointerdown?: Event;
	onpointerenter?: Event;
	onpointerleave?: Event;
	onpointermove?: Event;
	onpointerout?: Event;
	onpointerover?: Event;
	onpointerup?: Event;
	onprogress?: Event;
	onratechange?: Event;
	onreset?: Event;
	onresize?: Event;
	onscroll?: Event;
	onsearch?: Event;
	onseeked?: Event;
	onseeking?: Event;
	onselect?: Event;
	onselectstart?: Event;
	onshow?: Event;
	onstalled?: Event;
	onsubmit?: Event;
	onsuspend?: Event;
	ontimeupdate?: Event;
	ontoggle?: Event;
	onvolumechange?: Event;
	onwaiting?: Event;
	onwebkitfullscreenchange?: Event;
	onwebkitfullscreenerror?: Event;
	onwheel?: Event;

	onAbort?: Event;
	onAuxClick?: Event;
	onBeforeCopy?: Event;
	onBeforeCut?: Event;
	onBeforePaste?: Event;
	onBlur?: Event;
	onCancel?: Event;
	onCanPlay?: Event;
	onCanPlayThrough?: Event;
	onChange?: Event;
	onClick?: Event;
	onClose?: Event;
	onContextMenu?: Event;
	onCopy?: Event;
	onCueChange?: Event;
	onCut?: Event;
	onDblClick?: Event;
	onDrag?: Event;
	onDragEnd?: Event;
	onDragEnter?: Event;
	onDragLeave?: Event;
	onDragOver?: Event;
	onDragStart?: Event;
	onDrop?: Event;
	onDurationChange?: Event;
	onEmptied?: Event;
	onEnded?: Event;
	onError?: Event;
	onFocus?: Event;
	onGotPointerCapture?: Event;
	onInput?: Event;
	onInvalid?: Event;
	onKeydown?: Event;
	onKeypress?: Event;
	onKeyup?: Event;
	onLoad?: Event;
	onLoadedData?: Event;
	onLoadedMetaData?: Event;
	onLoadStart?: Event;
	onLostPointerCapture?: Event;
	onMouseDown?: Event;
	onMouseEnter?: Event;
	onMouseLeave?: Event;
	onMouseMove?: Event;
	onMouseOut?: Event;
	onMouseOver?: Event;
	onMouseUp?: Event;
	onMouseWheel?: Event;
	onPaste?: Event;
	onPause?: Event;
	onPlay?: Event;
	onPlaying?: Event;
	onPointerCancel?: Event;
	onPointerDown?: Event;
	onPointerEnter?: Event;
	onPointerLeave?: Event;
	onPointerMove?: Event;
	onPointerOut?: Event;
	onPointerOver?: Event;
	onPointerUp?: Event;
	onProgress?: Event;
	onRateChange?: Event;
	onReset?: Event;
	onResize?: Event;
	onScroll?: Event;
	onSearch?: Event;
	onSeeked?: Event;
	onSeeking?: Event;
	onSelect?: Event;
	onSelectStart?: Event;
	onShow?: Event;
	onStalled?: Event;
	onSubmit?: Event;
	onSuspend?: Event;
	onTimeUpdate?: Event;
	onToggle?: Event;
	onVolumeChange?: Event;
	onWaiting?: Event;
	onWebkitFullScreenChange?: Event;
	onWebkitFullScreenError?: Event;
	onWheel?: Event;
}

interface Props extends Events {
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
	width?: any;
	height?: any;
	defaultValue?: any;
	hidden?: any;
	innerHTML?: any;
}

interface Tree {
	flag: Flags;
	type: Type;
	props: Props;
	children: Children;
	node: Node | null;
	owner: Object | null;
	parent: Tree | null;
	key: any;
	yield: () => Tree | null;
	tag: string | null;
	host: Tree | null;
	group: Groups;
	async: number;
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

	// Elements
	export const createElement: createElement;
	export const h: createElement;

	// Render
	export function render (
		subject: Tree | Object | Function,
		target?: Node
	): void;

	// Test Utils
	export function shallow (subject: any): Tree;
}

declare const h: createElement;
declare module 'dio' { export = dio; }

