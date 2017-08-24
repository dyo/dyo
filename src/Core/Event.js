/**
 * @type {Object}
 */
var Event = {
	/**
	 * @param {Element} element
	 * @param {string} type
	 */
	addEventListener: function addEventListener (element, type) {
		if (!this[type]) {
			this[type] = new Map()
			document.addEventListener(type.substring(2), this, true)
		}

		this[type].set(element.DOM.target, element)
	},
	/**
	 * @param {Event} event
	 */
	handleEvent: function handleEvent (event) {
		var type = 'on'+event.type
		var element = this[type].get(event.target)

		if (element)
			try {
				var host = element.host
				var instance = host.instance
				var callback = element.event[type]
				var state = null

				if (!callback)
					return

				if (typeof callback === 'function')
					state = callback.call(instance, event)
				else if (typeof callback.handleEvent === 'function')
					state = callback.handleEvent(event)

				if (instance && state)
					lifecycleReturn(host, state)
			} catch (e) {
				errorBoundary(host, e, type+':'+getDisplayName(callback.handleEvent || callback))
			}
	}
}
