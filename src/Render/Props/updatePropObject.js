/**
 * update prop objects, i.e .style
 * 
 * @param  {Object} value
 * @param  {*}      targetAttr
 */
function updatePropObject (value, targetAttr) {
	for (var propName in value) {
		var propValue = value[propName] || null;

		// if targetAttr object has propName, assign
		if (propName in targetAttr) {
			targetAttr[propName] = propValue;
		}
	}
}

