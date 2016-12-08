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

