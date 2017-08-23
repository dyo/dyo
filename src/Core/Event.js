/**
 * @constructor
 * @param {Element} children
 */
function Event (children) {
	this.children = children
	this.length = 0
}
/**
 * @type {Object}
 */
Event.prototype = Object.create(null, {
	constructor: {value: Event},
	/**
	 * @param {Event} event
	 */
	handleEvent: {value: function handleEvent (event) {
		try {
			var type = 'on'+event.type
			var callback = this[type]
			var children = this.children
			var host = children.host
			var instance = host.instance
			var state

			switch (typeof callback) {
				case 'object':
					if (callback && typeof callback.handleEvent === 'function')
						state = callback.handleEvent(event)
					break
				case 'function':
					state = callback.call(instance, event)
			}

			if (state && instance)
				lifecycleReturn(host, state)
		} catch (e) {
			errorBoundary(host, e, type+':'+getDisplayName(callback.handleEvent || callback))
		}
	}}
})
