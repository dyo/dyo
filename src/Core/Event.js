/**
 * @param {Event}
 */
function handleEvent (event) {
	try {
		var type = event.type
		var element = this
		var callback = element.cache[type]
		var host = element.host
		var owner = host.owner || element
		var props = owner.props
		var state = owner.state
		var context = owner.context
		var value

		if (!callback)
			return

		if (typeof callback === 'function') {
			value = callback.call(owner, event, props, state, context)
		} else if (typeof callback.handleEvent === 'function') {
			if (owner !== callback && callback[SymbolComponent])
				host = getComponentElement(owner = callback)

			value = callback.handleEvent(event, props, state, context)
		}

		if (value && owner[SymbolComponent])
			getLifecycleState(host, value)
	} catch (err) {
		invokeErrorBoundary(host, err, 'on'+type+':'+getDisplayName(callback.handleEvent || callback), SharedErrorThrow)
	}
}
