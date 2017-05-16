// enums
declare enum Flag {
	Empty = 0,
	Text = 1,
	Element = 2,
	Composite = 3,
	Fragment = 4,
	Error = 5,
	Portal = 6
}

declare enum Async {
	Ready = 0,
	Processing = 1,
	Processed = 2,
	Pending = 3
}

declare enum Groups {
	Element = 0,
	Function = 1,
	Class = 2
}

// types
type Text = string | number;
type Key = Text;
type Ref = string | Function;
type Children = Array<Tree>;
type Type = string | Function | Tree | Node;
type State = object | null;
type Return = State | Promise<State> | void;
type Render = Tree | string | null | Array<any> | Return | Date;

interface createElement {
	(type: Type, props?: Props, ...children: Array<any>): Tree;
}

interface h extends createElement {}

// shapes
interface Event {
	(e: Event): Return;
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
	[props: string]: any;
	children?: Array<any>;
	ref?: Ref;
	key?: Key;
	className?: Text;
	class?: Text;
	id?: Text;
	checked?: boolean;
	value?: Text;
	style?: string | object;
	href?: Text;
	width?: Text;
	height?: Text;
	defaultValue?: Text;
	hidden?: boolean;
	innerHTML?: Text;
}

interface Tree {
	flag: Flag;
	type: Type;
	props: Props;
	attrs: Props;
	children: Children;
	node: Node | null;
	owner: Function | null;
	parent: Tree | null;
	key: Key;
	yield: Function | null;
	tag: string | null;
	host: Tree | null;
	group: Groups;
	async: Async;
	xmlns: string;
}

interface render {
	(subject?: any, container?: Node, callback?: Node | Function): void
}


declare global {
	namespace dio {
		interface Component<P> {
			componentWillUnmount(node: Node): Return;
		  componentWillMount(node: Node): Return;
		  componentDidMount(node: Node): Return;
		  shouldComponentUpdate(nextProps: Props, nextState, State): Boolean | void;
		  componentWillUpdate(nextProps: Props, nextState, State): Return;
		  componentDidUpdate(prevProps: Props, prevState, State): Return;
		}

		export const version;
		export const h: h;
		export const createElement;
		export const render;

		export abstract class Component<P> {
			constructor (props: P);
			abstract render(props: Props, state: State): Render;
			forceUpdate (callback?: () => Return): void;
			setState (state: State, callback?: () => Return): void;
			state: State;
			props: Props;
			refs: object | null;
		}
	}

	const h: h;

	namespace JSX {
		interface Element extends Tree {}
		interface ElementClass extends dio.Component<Props> {
			render(props: Props, state: State): Render;
		}
		interface ElementAttributesProperty {props: Props;}
		interface ElementChildrenAttribute {children: Children;}

		interface IntrinsicAttributes extends Props {}
		interface IntrinsicClassAttributes extends Props {}

		interface IntrinsicElements {
			[props: string]: Props;
		}
	}
}

export = dio;
