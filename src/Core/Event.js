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
		var value

		if (!callback)
			return

		if (instance) {
			props = instance.props
			state = instance.state
			context = instance.context
		}

		if (typeof callback === 'function')
			value = callback.call(instance, event, props, state, context)
		else if (typeof callback.handleEvent === 'function')
			value = callback.handleEvent(event, props, state, context)

		if (value && instance)
			getLifecycleReturn(host, value)
	} catch (err) {
		invokeErrorBoundary(host, err, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorPassive)
	}
}

defineProperty(Element.prototype, 'handleEvent', {value: handleEvent})
