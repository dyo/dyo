/**
 * @param {Event}
 */
function handleEvent (event) {
	try {
		var type = event.type
		var element = this
		var host = element.host
		var instance = host.instance
		var callback = element.event[type]
		var state

		if (!callback)
			return

		if (typeof callback === 'function')
			state = callback.call(instance, event)
		else if (typeof callback.handleEvent === 'function')
			state = callback.handleEvent(event)

		if (instance && state)
			lifecycleReturn(host, state)
	} catch (e) {
		errorBoundary(host, e, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), ErrorPassive)
	}
}

defineProperty(Element.prototype, 'handleEvent', {value: handleEvent})
