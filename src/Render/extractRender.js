/**
 * extract VNode from render function
 *
 * @param  {Object} subject
 * @return {Object}
 */
function extractRender (component) {
	// retrieve vnode
	var vnode = component.render(component.props, component.state, component);

	// if vnode, else fragment
	return vnode.nodeType !== void 0 ? vnode : VFragment(vnode);
}

