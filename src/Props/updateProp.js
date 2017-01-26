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
		name === 'children' ||
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

	// svg element, default to class instead of className
	if (namespace === nsSvg) {
		isSVG = true;
		propName = name === 'className' ? 'class' : name;
	}
	// html element, default to className instead of class
	else {
		propName = name === 'class' ? 'className' : name;
	}

	var targetProp = target[propName];
	var isDefinedValue = propValue != null && propValue !== false;

	// objects
	if (isDefinedValue && typeof propValue === 'object') {
		targetProp === void 0 ? target[propName] = propValue : updatePropObject(propName, propValue, targetProp);
	}
	// primitives `string | number | boolean`
	else {
		// id, className etc..
		if (targetProp !== void 0 && isSVG === false) {
			if (propName === 'style') {
				target.style.cssText = propValue;
			}
			else {
				target[propName] = propValue;
			}
		}
		// setAttribute/removeAttribute
		else {
			if (isDefinedValue) {
				// reduce value to an empty string if true, <tag checked=true> --> <tag checked>
				propValue === true && (propValue = '');

				target.setAttribute(propName, propValue);
			}
			else {
				// remove attributes with false/null/undefined values
				target.removeAttribute(propName);
			}
		}
	}
}

