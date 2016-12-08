/**
 * assign prop for create element
 * 
 * @param  {Node}   target
 * @param  {Object} props
 * @param  {number} onlyEvents
 */
function assignProps (target, props, onlyEvents) {
	for (var name in props) {
		assignProp(target, name, props, onlyEvents);
	}
}

