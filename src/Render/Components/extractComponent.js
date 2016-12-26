/**
 * extract component
 * 
 * @param  {VNode} subject
 * @return {VNode} 
 */
function extractComponent (subject) {
	var type = subject.type;
	var candidate;
	
	if (type.COMPCache !== void 0) {
		// cache
		candidate = type.COMPCache;
	} else if (type.constructor === Function && (type.prototype === void 0 || type.prototype.render === void 0)) {
		// function components
		candidate = type.COMPCache = createClass(type);
	} else {
		// class / createClass components
		candidate = type;
	}

	// create component instance
	var component = subject.instance = new candidate(subject.props);

	// add children to props if not empty
	if (subject.children.length !== 0) {
		component.props.children = subject.children;
	}
	
	// retrieve vnode
	var vnode = extractRender(component);

	// if keyed, assign key to vnode
	if (subject.props.key !== void 0 && vnode.props.key === void 0) {
		vnode.props.key = subject.props.key;
	}

	// if render returns a component, extract that component
	if (vnode.nodeType === 2) {
		vnode = extractComponent(vnode);
	}

	// replace props and children of old vnode
	subject.props    = vnode.props
	subject.children = vnode.children;

	// assign reference to component and return vnode
	return component.VNode = vnode;
}

