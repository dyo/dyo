/**
 * assign prop for create element
 * 
 * @param  {Node}   target
 * @param  {string} name
 * @param  {Object} props
 * @param  {number} onlyEvents
 */
function assignProp (target, name, props, onlyEvents) {
	var propValue = props[name];

	if (isEventName(name)) {
		// add event listener
		target.addEventListener(extractEventName(name), propValue, false);
	} else if (onlyEvents === false) {
		// add attribute
		updateProp(target, 'setAttribute', name, propValue, props.xmlns);
	}
}

