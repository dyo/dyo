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
		var value = props[name];

		// refs
		if (name === 'ref' && value != null) {
			refs(value, component, target);
		}
		// events
		else if (isEventProp(name)) {
			addEventListener(target, name.substring(2).toLowerCase(), value, component);
		}
		// attributes
		else if (onlyEvents === false && name !== 'key' && name !== 'children') {
			// add attribute
			updateProp(target, true, name, value, props.xmlns);
		}
	}
}

