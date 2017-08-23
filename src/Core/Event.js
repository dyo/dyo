/**
 * @type {Object}
 */
var Events = {
	addEventListener: function addEventListener (type) {
		document.addEventListener(type, this, true)
	},
	/**
	 * @param {Event} event
	 */
	handleEvent: function handleEvent (event) {
		this.dispatchEvent('on'+event.type, event, event.target)
	},
	/**
	 * @param {string} type
	 * @param {Event} event
	 * @return {Boolean}
	 */
	dispatchEvent: function dispatchEvent (type, event) {
		if (this[type] && this[type].has(event.target))
			this.dispatch(event, type)
	},
	/**
	 * @param {Event} event
	 * @param {string} type
	 */
	dispatch: function dispatch (event, type) {
		try {
			var element = this[type].get(event.target)
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
	},
	/**
	 * @param {Element} element
	 * @param {string} type
	 */
	attach: function attach (element, type) {
		if (!this[type]) {
			this[type] = new Map()
			this.addEventListener(type.substring(2))
		}

		this[type].set(element.DOM.node, element)
	}
}
