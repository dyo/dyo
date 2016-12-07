/**
 * withAttr
 * 
 * @param  {(any[]|string)}      props
 * @param  {function[]|function} setters
 * @param  {function=}           callback
 * @return {function=}           
 */
function withAttr (props, setters, callback) {
	var component = this, isarray = typeof props === 'object';

	return function () {
		// array of bindings
		if (isarray) {
			for (var i = 0, length = props.length; i < length; i++) {
				updateAttr(this, props[i], setters[i]);
			}
		} else {
			updateAttr(this, props, setters);
		}

		callback ? callback(component) : component.forceUpdate();
	}
}


/**
 * withAttr(update attribute)
 * 
 * @param  {Node}           target
 * @param  {(string|any[])} prop
 * @param  {function}       setter
 */
function updateAttr (target, prop, setter) {
	var value;

	if (typeof prop === 'string') {
		value = prop in target ? target[prop] : target.getAttribute(prop);

		if (value != null) { 
			setter(value); 
		}
	} else {
		value = prop();
		
		if (value != null) {
			setter in target ? target[setter] = value : target.setAttribute(setter, value);
		}
	}
}

