/**
 * diff newProps agains oldProps
 * 
 * @param  {VNode}   newNode 
 * @param  {VNode}   oldNode 
 * @param  {string}  newName
 * @param  {string}  namespace
 * @param  {Array[]} diff
 * @return {Array[]}          
 */
function diffNewProps (newNode, oldNode, newName, namespace, diff) {
	var newValue = newNode.props[newName];
	var oldValue = oldNode.props[newName];

	if (newValue != null && oldValue !== newValue) {
		diff[diff.length] = ['setAttribute', newName, newValue, namespace];
	}
}

