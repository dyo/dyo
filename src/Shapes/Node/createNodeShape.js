/**
 * create node shape
 *
 * @param  {number}                      Type
 * @param  {(string|function|Component)} type
 * @param  {Object<string, any>}         props
 * @param  {VNode[]}                     children
 * @param  {Node}                        DOMNode
 * @param  {Component}                   instance
 * @param  {number}                      index
 * @param  {string?}                     nodeName
 * @param  {any}                         key
 * @return {VNode}
 */
function createNodeShape (Type, type, props, children, DOMNode, instance, index, nodeName, key) {
	return {
		Type: Type,
		type: type,
		props: props,
		children: children,
		DOMNode: DOMNode,
		instance: instance,
		index: index,
		nodeName: nodeName,
		key: key
	};
}

