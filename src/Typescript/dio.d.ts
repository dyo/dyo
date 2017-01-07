declare enum nodeType {
	Empty = 0,
	Element = 1,
	Component = 2,
	Text = 3,
	Fragment = 11
}

type Key = string | number;
type Ref = string | Function;
type Children = VNode[];
type Type = string | Component<Props> | Function;

interface Props {
	children?: Children;
	ref?: Ref;
	key?: Key;
}

// VNode shapes
interface VNode {
	nodeType: nodeType;
	type: Type;
	props: Props;
	children: Children;
	DOMNode: Node;
	instance: Component<Props>;
	index: number
}

interface VText implements VNode {
	nodeType: nodeType.VText;
}

interface VComponent implements VNode {
	nodeType: nodeType.Component;
}

interface VElement implements VNode {
	nodeType: nodeType.VElement;
}

interface VFragment implements VNode {
	nodeType: nodeType.VFragment;
}

// HTTP Shape
interface VRequest {
	method: string;
	url: string;
	payload: string | Object;
	enctype: string;
	responseType: string;
	withCredentials: boolean;
	headers: Object<string, any>;
	initial: any;
	config: (xhr: XMLHttpRequest) => void;
	username: string;
	password: string;
}

// Components
declare class Component <P> {
	constructor (props?: P);
	forceUpdate (callback?: () => void): void;
	setState (state: Object<string, any>, callback?: () => void): void;
	VNode?: VNode;
	refs?: any;
	state?: any;
	props?: P;
}

declare function createClass(shape: Function | Object): Component<Props>;

// Elements
declare function createElement(type: Type, props?: Props, ...children): VNode;
declare function cloneElement(element: VNode, props: Props, children: Children): VNode;
declare function isValidElement(any): boolean;
declare function createFactory(type: Type, props: Props): createElement;
declare function DOM(types: string[]): Object<string, createElement>;

// Shape Factories
declare function VElement(type: Type, props: Props, children: Children)
declare function VComponent(type: Type, props: Props, children: Children)
declare function VText(type: Type, props: Props, children: Children)
declare function VSvg(type: Type, props: Props, children: Children)

// Render
declare function render(subject: Component | VNode | Object<string, any> | Function): (props: Props) => void;
declare function shallow(subject: Component | VNode | Object<string, any> | Function): VNode;

declare module 'dio' {
	
}

