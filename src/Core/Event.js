/**
 * @alias Element#handleEvent
 * @memberof Element
 * @this {Element}
 * @param {Event}
 */
function handleEvent (event) {
	var element = this
	var callback = getNodeListener(element, event)

	if (!callback)
		return

	if (typeof callback === 'object')
		if (callback[SymbolForIterator] || ArrayIsArray(callback))
			return iterate(callback, function (callback) {
				dispatchEvent(element, event, callback)
			})

	dispatchEvent(element, event, callback)
}

/**
 * @param {Element} element
 * @param {Event} event
 * @param {(function|object)?} callback
 */
function dispatchEvent (element, event, callback) {
	try {
		var host = element.host
		var owner = host.owner
		var props = owner.props
		var state = owner.state
		var context = owner.context
		var value

		if (typeof callback === 'function') {
			value = callback.call(owner, event, props, state, context)
		} else if (typeof callback.handleEvent === 'function') {
			if (owner !== callback && callback[SymbolForComponent])
				host = (owner = callback)[SymbolForElement]

			value = callback.handleEvent(event, props, state, context)
		}

		if (value && owner[SymbolForComponent])
			enqueueComponentValue(host, SharedSiteEvent, value)
	} catch (err) {
		reportErrorException(host, err, SharedSiteEvent+':'+getDisplayName(callback.handleEvent || callback))
	}
}
