/**
 * handles diff props
 * 
 * @param  {Object} node
 * @param  {number} index
 * @param  {Object} old
 */
function patchProps (newNode, oldNode) {
	var propsDiff = diffProps(newNode.props, oldNode.props, newNode.props.xmlns || '', []);
	var length = propsDiff.length;

	// if diff length > 0 apply diff
	if (length !== 0) {
		var target = oldNode._node;

		for (var i = 0; i < length; i++) {
			var prop = propsDiff[i];
			// [0: action, 1: name, 2: value, namespace]
			updateProp(target, prop[0], prop[1], prop[2], prop[3]);
		}

		oldNode.props = newNode.props;
	}
}


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


/**
 * diff newProps agains oldProps
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldProps 
 * @param  {string}  newName
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffNewProps (newProps, oldProps, newName, namespace, propsDiff) {
	var newValue = newProps[newName];
	var oldValue = oldProps[newName];

	if (newValue != null && oldValue !== newValue) {
		propsDiff[propsDiff.length] = ['setAttribute', newName, newValue, namespace];
	}
}


/**
 * diff oldProps agains newProps
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldName 
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffOldProps (newProps, oldName, namespace, propsDiff) {
	var newValue = newProps[oldName];

	if (newValue == null) {
		propsDiff[propsDiff.length] = ['removeAttribute', oldName, '', namespace];
	}
}

