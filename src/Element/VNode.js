/**
 * virtual node factory
 * 
 * @param {number}                      nodeType
 * @param {(function|Component|string)} type
 * @param {Object}                      props
 * @param {VNode[]}                     children
 * @param {?Node}                      _node
 * @param {?Component}                 _owner
 * @param {?index}                     _index
 */
function VNode (nodeType, type, props, children, _node, _owner, _index) {
	return {
		nodeType: nodeType,
		type: type,
		props: props,
		children: children,
		_node: _node,
		_owner: _owner,
		_index: _index
	};
}

