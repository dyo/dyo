/**
 * collect prop diffs
 * 
 * @param  {VNode}   newNode 
 * @param  {VNode}   oldNode 
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffProps (newNode, oldNode, namespace, diff) {
	// diff newProps
	for (var newName in newNode.props) { 
		diffNewProps(newNode, oldNode, newName, namespace, diff); 
	}

	// diff oldProps
	for (var oldName in oldNode.props) { 
		diffOldProps(newNode, oldName, namespace, diff); 
	}

	return diff;
}

