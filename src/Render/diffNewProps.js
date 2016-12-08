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

