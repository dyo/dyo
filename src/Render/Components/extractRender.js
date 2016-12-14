/**
 * extract a render function
 *
 * @param  {Component} component
 * @return {VNode}
 */
function extractRender (component) {
	// extract render
	var vnode = component.render(component.props, component.state, component) || VEmpty();

	// if vnode, else fragment
	return vnode.nodeType !== void 0 ? vnode : VFragment(vnode);
}

