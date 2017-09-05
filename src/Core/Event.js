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
		var props
		var state
		var context
		var result

		if (!callback)
			return
		
		if (instance) {
			props = instance.props
			state = instance.state
			context = instance.context
		}

		if (typeof callback === 'function')
			result = callback.call(instance, event, props, state, context)
		else if (typeof callback.handleEvent === 'function')
			result = callback.handleEvent(event, props, state, context)

		if (result && instance)
			getLifecycleReturn(host, result)
	} catch (e) {
		errorBoundary(host, e, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorPassive)
	}
}

defineProperty(Element.prototype, 'handleEvent', {value: handleEvent})
