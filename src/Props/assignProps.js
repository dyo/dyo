/**
 * assign prop for create element
 * 
 * @param  {Node}       target
 * @param  {Object}     props
 * @param  {boolean}    onlyEvents
 * @param  {Component}  component
 */
function assignProps (target, props, onlyEvents, component) {
	for (var name in props) {
		if (isEventName(name)) {
			addEventListener(target, extractEventName(name), props[name], component);
		}
		else if (onlyEvents === false) {
			// add attribute
			updateProp(target, 'setAttribute', name, props[name], props.xmlns);
		}
	}
}

