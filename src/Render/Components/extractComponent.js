/**
 * extract component
 * 
 * @param  {VNode} subject
 * @return {VNode} 
 */
function extractComponent (subject, mutate) {
	var candidate;
	var type = subject.type;

	if (type._component !== void 0) {
		// cache
		candidate = type._component;
	} else if (type.constructor === Function && type.prototype.render === void 0) {
		// function components
		candidate = type._component = createClass(type);
	} else {
		// class / createClass components
		candidate = type;
	}

	// create component instance
	var component = subject._owner = new candidate(subject.props);

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

	// assign reference to component 
	component._vnode = vnode;

	return vnode;
}

