/**
 * assign/update/remove prop
 * 
 * @param  {Node}   target
 * @param  {string} action
 * @param  {string} name
 * @param  {any}    propValue
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

	var isSVG = false;
	var propName;

	// normalize class/className references, i.e svg className !== html className
	// uses className instead of class for html elements
	if (namespace === nsSvg) {
		isSVG = true;
		propName = name === 'className' ? 'class' : name;
	} else {
		propName = name === 'class' ? 'className' : name;
	}

	var targetProp = target[propName];
	var isDefinedValue = propValue != null && propValue !== false;

	// objects, adds property if undefined, else, updates each memeber of attribute object
	if (isDefinedValue && typeof propValue === 'object') {
		targetProp === void 0 ? target[propName] = propValue : updatePropObject(propValue, targetProp);
	} else {
		if (targetProp !== void 0 && isSVG === false) {
			target[propName] = propValue;
		} else {
			if (isDefinedValue) {
				// reduce value to an empty string if true, <tag checked=true> --> <tag checked>
				if (propValue === true) { 
					propValue = ''; 
				}

				target[action](propName, propValue);
			} else {
				// remove attributes with false/null/undefined values
				target.removeAttribute(propName);
			}
		}
	}
}

