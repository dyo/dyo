/**
 * ---------------------------------------------------------------------------------
 * 
 * types
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * @typedef {
 *          Object<string, any>{
 *          	nodeType: {number}, 
 *          	type:     {(Component|function|string)},
 *          	props:    {Object},
 *          	children: {VNode[]},
 *          	_node:    {(Node=)}
 *          	_owner:   {(Component=)}
 *          }
 * } VNode
 */


/**
 * @typedef {
 *          Object<string, any>{
 *          	setState:    {function(Object)},
 *          	forceUpdate: {function}
 *          	bindState:   {function(property: {string}, attr: {string}, preventUpdate: {boolean=}): Function}
 *          	render:      {function(props: {Object}, state: {Object}, this: {Object}): VNode}
 *          }
 * } Component
 */

