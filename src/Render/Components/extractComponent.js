/**
 * extract component
 * 
 * @param  {VNode} subject
 * @return {VNode} 
 */
function extractComponent (subject) {
	/** @type {Component} */
	var owner;

	/** @type {(Component|function(new:Component, Object<string, any>))} */
	var type = subject.type;

	/** @type {Object<string, any>} */
	var props = subject.props;

	// default props
	if (type.defaultProps !== void 0) {
		// clone default props if props is not an empty object, else use defaultProps as props
		props !== objEmpty ? assignDefaultProps(type.defaultProps, props) : (props = type.defaultProps);
	}

	// assign children to props if not empty
	if (subject.children.length !== 0) {
		// prevents mutating the empty object constant
		if (props === objEmpty) {
			props = { children: subject.children };
		}
		else {
			props.children = subject.children;			
		}
	}
	
	// cached component
	if (type.COMPCache !== void 0) {
		owner = type.COMPCache;
	} 
	// function components
	else if (type.constructor === Function && (type.prototype === void 0 || type.prototype.render === void 0)) {
		// create component
		owner = createClass(type);
	}
	// class / createClass components
	else {
		owner = type;
	}

	// create component instance
	var component = subject.instance = new owner(props);
	
	// retrieve vnode
	var vnode = extractRender(component);

	// if keyed, assign key to vnode
	if (props.key !== void 0 && vnode.props.key === void 0) {
		vnode.props.key = props.key;
	}

	// if render returns a component, extract that component
	if (vnode.nodeType === 2) {
		vnode = extractComponent(vnode);
	}

	// replace props and children
	subject.props    = vnode.props
	subject.children = vnode.children;

	// assign reference to component and return vnode
	return component.VNode = vnode;
}

