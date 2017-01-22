/**
 * create VNode shape
 *
 * @param  {number}                      nodeType
 * @param  {(string|function|Component)} type
 * @param  {Object<string, any>}         props
 * @param  {VNode[]}                     children
 * @param  {Node}                        DOMNode
 * @param  {Component}                   instance
 * @param  {number}                      index
 * @param  {Component}                   parent
 * @return {VNode}
 */
function createVNodeShape (nodeType, type, props, children, DOMNode, instance, index, parent, key) {
	return {
		nodeType: nodeType,
		type: type,
		props: props,
		children: children,
		DOMNode: DOMNode,
		instance: instance,
		index: index,
		parent: parent,
		key: key
	};
}

