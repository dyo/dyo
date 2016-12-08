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
		if (component !== null) {
			var funcName = propValue.name;

			// auto bind event listeners to component
			if (component[funcName] === propValue) {
				propValue = component[funcName] = propValue.bind(component);
			}
		}

		// add event listener
		target.addEventListener(extractEventName(name), propValue, false);
	} else if (onlyEvents === false) {
		// add attribute
		updateProp(target, 'setAttribute', name, propValue, props.xmlns);
	}
}

