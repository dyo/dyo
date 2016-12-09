/**
 * extract a render function
 *
 * @param  {Component} component
 * @return {VNode}
 */
function extractRender (component) {
	// retrieve vnode
	var vnode = component.render(component.props, component.state, component);

	// if vnode, else fragment
	return vnode.nodeType !== void 0 ? vnode : VFragment(vnode);
}

