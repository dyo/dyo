/**
 * diff oldProps agains newProps
 * 
 * @param  {VNode}   newNode 
 * @param  {Object}  oldName 
 * @param  {string}  namespace
 * @param  {Array[]} diff
 * @return {Array[]}          
 */
function diffOldProps (newNode, oldName, namespace, diff) {
	var newValue = newNode.props[oldName];

	if (newValue == null) {
		diff[diff.length] = ['removeAttribute', oldName, '', namespace];
	}
}

