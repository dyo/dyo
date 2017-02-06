/**
 * assign/update/remove prop
 * 
 * @param  {Node}    target
 * @param  {boolean} set
 * @param  {string}  name
 * @param  {any}     value
 * @param  {string}  namespace
 */
function updateProp (target, set, name, value, namespace) {
	var length = name.length;

	// avoid xmlns namespaces
	if (length > 22 && (value === nsSvg || value === nsMath)) {
		return;
	}

	// if xlink:href set, exit, 
	if (length === 10 && name === 'xlink:href') {
		target[(set ? 'set' : 'remove') + 'AttributeNS'](nsXlink, 'href', value);
		return;
	}

	var svg = false;

	// svg element, default to class instead of className
	if (namespace === nsSvg) {
		svg = true;

		if (length === 9 && name === 'className') {
			name = 'class';
		}
		else {
			name = name;
		}
	}
	// html element, default to className instead of class
	else {
		if (length === 5 && name === 'class') {
			name = 'className';
		}
	}

	var destination = target[name];
	var defined = value != null && value !== false;

	// objects
	if (defined && typeof value === 'object') {
		destination === void 0 ? target[name] = value : updatePropObject(name, value, destination);
	}
	// primitives `string, number, boolean`
	else {
		// id, className, style, etc..
		if (destination !== void 0 && svg === false) {
			if (length === 5 && name === 'style') {
				target.style.cssText = value;
			}
			else {
				target[name] = value;
			}
		}
		// set/remove Attribute
		else {
			if (defined && set) {
				// assign an empty value with boolean `true` values
				target.setAttribute(name, value === true ? '' : value);
			}
			else {
				// removes attributes with false/null/undefined values
				target.removeAttribute(name);
			}
		}
	}
}

