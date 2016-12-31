/**
 * VNode shape
 *
 * @param  {number}                      nodeType
 * @param  {(string|function|Component)} type
 * @param  {Object<string, any>}         props
 * @param  {VNode[]}                     children
 * @param  {Node}                        DOMNode
 * @param  {Component}                   instance
 * @param  {number}                      index
 * @return {VNode}
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

