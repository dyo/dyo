/**
 * assign prop for create element
 * 
 * @param  {Node}       target
 * @param  {string}     name
 * @param  {Object}     props
 * @param  {number}     onlyEvents
 * @param  {?Component} component
 */
function assignProp (target, name, props, onlyEvents, component) {
	var propValue = props[name];

	if (isEventName(name)) {
		target.addEventListener(extractEventName(name), propValue);
	} else if (onlyEvents === false) {
		// add attribute
		updateProp(target, 'setAttribute', name, propValue, props.xmlns);
	}
}

