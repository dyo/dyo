/**
 * extract component node
 * 
 * @param  {VNode}      subject
 * @param  {Component?} instance
 * @param  {VNode?}     parent
 * @return {VNode} 
 */
function extractComponentNode (subject, instance, parent) {
	/** @type {Component} */
	var owner;

	/** @type {VNode} */
	var vnode;

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
			props = {children: subject.children};
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
		vnode = extractFunctionNode(type, props);

		if (vnode.Type === void 0) {
			// create component
			owner = createClass(vnode, props);
		}
		else {
			// pure function
			return vnode;
		}
	}
	// class / createClass components
	else {
		owner = type;
	}

	// create component instance
	var component = subject.instance = new owner(props);
	
	// retrieve vnode
	var vnode = extractRenderNode(component);

	// if render returns a component, extract component recursive
	if (vnode.Type === 2) {
		vnode = extractComponentNode(vnode, component, parent || subject);
	}

	// if keyed, assign key to vnode
	if (subject.key !== void 0 && vnode.key === void 0) {
		vnode.key = subject.key;
	}

	// replace props and children
	subject.props = vnode.props
	subject.children = vnode.children;

	// recursive component
	if (instance !== null) {
		component['--vnode'] = parent;
	}
	else {
		component['--vnode'] = subject;
		
		subject.nodeName = vnode.type;
	}

	return vnode;
}

