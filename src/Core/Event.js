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
			this[type] = new WeakMap()
			DOMEvent(type.substring(2), this, true)
		}

		this[type].set(DOMNode(element), element)
	},
	dispatchEvent: function (element, type, event) {
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
			errorBoundary(host, e, type+':'+getDisplayName(callback.handleEvent || callback), 0)
		}
	},
	/**
	 * @param {Event} event
	 */
	handleEvent: function handleEvent (event) {
		var type = 'on'+event.type
		var target = event.target
		var bubbles = event.bubbles
		var map = this[type]

		while (target)
			if (map.has(target))
				return this.dispatchEvent(map.get(target), type, defineProperty(event, 'currentTarget', {value: target}))
			else if (bubbles)
				target = DOMParent(target)
			else
				break
	}
}
