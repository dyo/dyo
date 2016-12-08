/**
 * assign/update/remove prop
 * 
 * @param  {Node}   target
 * @param  {string} action
 * @param  {string} name
 * @param  {*}      propValue
 * @param  {string} namespace
 */
function updateProp (target, action, name, propValue, namespace) {
	// avoid refs, keys, events and xmlns namespaces
	if (name === 'ref' || 
		name === 'key' || 
		isEventName(name) || 
		propValue === nsSvg || 
		propValue === nsMath
	) {
		return;
	}

	// if xlink:href set, exit, 
	if (name === 'xlink:href') {
		return (target[action + 'NS'](nsXlink, 'href', propValue), void 0);
	}

	var isSVG = 0;
	var propName;

	// normalize class/className references, i.e svg className !== html className
	// uses className instead of class for html elements
	if (namespace === nsSvg) {
		isSVG = 1;
		propName = name === 'className' ? 'class' : name;
	} else {
		propName = name === 'class' ? 'className' : name;
	}

	var targetProp = target[propName];
	var isDefinedValue = (propValue != null && propValue !== false) ? 1 : 0;

	// objects, adds property if undefined, else, updates each memeber of attribute object
	if (isDefinedValue === 1 && typeof propValue === 'object') {
		targetProp === void 0 ? target[propName] = propValue : updatePropObject(propValue, targetProp);
	} else {
		if (targetProp !== void 0 && isSVG === 0) {
			target[propName] = propValue;
		} else {
			// remove attributes with false/null/undefined values
			if (isDefinedValue === 0) {
				target['removeAttribute'](propName);
			} else {
				// reduce value to an empty string if true, <tag checked=true> --> <tag checked>
				if (propValue === true) { 
					propValue = ''; 
				}

				target[action](propName, propValue);
			}
		}
	}
}

