/**
 * extract node
 * 
 * @param  {Object} subject
 * @param  {Object} props
 * @return {Object} 
 */
function extractVNode (subject) {	
	// static node
	if (subject.nodeType !== 2) {
		return subject;
	}

	// possible component class, type
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

	if (subject.children.length !== 0) {
		component.props.children = subject.children;
	}
	
	// retrieve vnode
	var vnode = extractRender(component);

	// if keyed, assign key to vnode
	if (subject.props.key !== void 0 && vnode.props.key === void 0) {
		vnode.props.key = subject.props.key;
	}

	// if render returns a component
	if (vnode.nodeType === 2) {
		vnode = extractVNode(vnode);
	}

	// assign component node
	component._vnode = VNode(
		vnode.nodeType,
		vnode.type,
		subject.props = vnode.props, 
		subject.children = vnode.children,
		null,
		null
	);

	if (type.stylesheet === void 0) {
		type.stylesheet = component.stylesheet !== void 0 ? component.stylesheet : null;
	}

	return vnode;
}

