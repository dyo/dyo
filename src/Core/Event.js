/**
 * @param {Event}
 */
function handleEvent (event) {
	try {
		var type = event.type
		var element = this
		var callback = element.event[type]
		var host = element.host
		var instance = host.instance
		var owner = instance ? instance : element
		var props = owner.props
		var state = owner.state
		var context = owner.context
		var value

		if (!callback)
			return

		if (typeof callback === 'function') {
			value = callback.call(instance, event, props, state, context)
		} else if (typeof callback.handleEvent === 'function') {
			if (instance !== callback && callback[SymbolComponent] === SymbolComponent)
				host = getComponentElement(instance = callback)

			value = callback.handleEvent(event, props, state, context)
		}

		if (value && instance)
			getLifecycleReturn(host, value)
	} catch (err) {
		invokeErrorBoundary(host, err, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorPassive)
	}
}
