/**
 * VNode shape
 * 
 * @param {number}                      nodeType
 * @param {(function|Component|string)} type
 * @param {Object}                      props
 * @param {VNode[]}                     children
 * @param {?Node}                       DOMNode
 * @param {?Component}                  instance
 * @param {?index}                      index
 */
function VNode (nodeType, type, props, children, DOMNode, instance, index) {
	return {
		nodeType: nodeType,
		type: type,
		props: props,
		children: children,
		DOMNode: DOMNode,
		instance: instance,
		index: index
	};
}

