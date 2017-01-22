/**
 * assign prop for create element
 * 
 * @param  {Node}       target
 * @param  {string}     name
 * @param  {Object}     props
 * @param  {boolean}    onlyEvents,
 * @param  {Component}  component
 */
function assignProp (target, name, props, onlyEvents, component) {
	if (isEventName(name)) {
		addEventListener(target, extractEventName(name), props[name], component);
	}
	else if (onlyEvents === false) {
		// add attribute
		updateProp(target, 'setAttribute', name, props[name], props.xmlns);
	}
}

