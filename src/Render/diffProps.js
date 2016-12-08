/**
 * collect prop diffs
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldProps 
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffProps (newProps, oldProps, namespace, propsDiff) {
	// diff newProps
	for (var newName in newProps) { 
		diffNewProps(newProps, oldProps, newName, namespace, propsDiff); 
	}
	// diff oldProps
	for (var oldName in oldProps) { 
		diffOldProps(newProps, oldName, namespace, propsDiff); 
	}

	return propsDiff;
}

