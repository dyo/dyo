/**
 * assign prop for create element
 * 
 * @param  {Node}       target
 * @param  {string}     name
 * @param  {Object}     props
 * @param  {number}     onlyEvents,
 * @param  {Component}  component
 */
function assignProp (target, name, props, onlyEvents, component) {
	var propValue = props[name];

	if (isEventName(name)) {
		var eventName = extractEventName(name);

		if (typeof propValue !== 'function') {
			var cache = component._cache === null ? component._cache = {} : component._cache;

			target.addEventListener(
				eventName, 
				cache[eventName] || bindEvent(eventName, propValue, cache, component)
			)
		} else {
			target.addEventListener(eventName, propValue);
		}
	} else if (onlyEvents === false) {
		// add attribute
		updateProp(target, 'setAttribute', name, propValue, props.xmlns);
	}
}

