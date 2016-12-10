/**
 * internal virtual node factory
 * 
 * @param {number}            nodeType
 * @param {(function|string)} type
 * @param {Object}            props
 * @param {VNode[]}           children
 * @param {(?Node)}           _node
 * @param {Component}         _owner
 */
function VNode (nodeType, type, props, children, _node, _owner) {
	return {
		nodeType: nodeType,
		type: type,
		props: props,
		children: children,
		_node: _node,
		_owner: _owner
	};
}

