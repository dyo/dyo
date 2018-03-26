/**
 * @param {Event}
 */
function handleEvent (event) {
	try {
		var element = this
		var callback = getNodeListener(element, event)
		var host = element.host
		var owner = host.owner
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
				host = (owner = callback)[SymbolElement]

			value = callback.handleEvent(event, props, state, context)
		}

		if (value && owner[SymbolComponent])
			enqueueComponentValue(host, SharedSiteEvent, value)
	} catch (err) {
		reportErrorException(host, err, SharedSiteEvent+':'+getDisplayName(callback.handleEvent || callback))
	}
}
