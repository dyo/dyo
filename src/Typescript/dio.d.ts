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
type Type = string |Component<Props> | Function;

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

interface VText extends VNode {
	nodeType: nodeType.VText;
}

interface VComponent extends VNode {
	nodeType: nodeType.Component;
}

interface VElement extends VNode {
	nodeType: nodeType.VElement;
}

interface VFragment extends VNode {
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

declare namespace dio {
	// Components
	export class Component <P> {
		constructor (props?: P);
		forceUpdate (callback?: () => void): void;
		setState (state: Object<string, any>, callback?: () => void): void;
		VNode?: VNode;
		refs?: any;
		state?: any;
		props?: P;
	}

	export function createClass (shape: Function | Object): Component<Props>;

	// Elements
	export function createElement (type: Type, props?: Props, ...children): VNode;
	export function h (type: Type, props?: Props, ...children): VNode;

	export function cloneElement (element: VNode, props: Props, children: Children): VNode;
	export function isValidElement (any): boolean;
	export function createFactory (type: Type, props: Props): createElement;
	export function DOM (types: string[]): Object<string, createElement>;

	// Shape Factories
	export function VElement (type: Type, props: Props, children: Children);
	export function VComponent (type: Type, props: Props, children: Children);
	export function VText (type: Type, props: Props, children: Children);
	export function VSvg (type: Type, props: Props, children: Children);

	// Render
	export function render
	(
		subject: Component | VNode | Object<string, any> | Function, 
		target: string | Node, 
		callback: (Node) => void,
		hydration: boolean
	): (props: Props) => void; 

	export function shallow (subject: Component | VNode | Object<string, any> | Function): VNode;
	
	export const version: string
}

declare function h (type: Type, props?: Props, ...children): VNode;

declare module 'dio' { export = dio; }

