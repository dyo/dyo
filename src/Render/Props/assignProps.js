/**
 * assign prop for create element
 * 
 * @param  {Node}       target
 * @param  {Object}     props
 * @param  {number}     onlyEvents
 * @param  {Component}  component
 */
function assignProps (target, props, onlyEvents, component) {
	for (var name in props) {
		assignProp(target, name, props, onlyEvents, component);
	}
}

