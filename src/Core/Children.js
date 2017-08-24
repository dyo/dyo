/**
 * @type {Object}
 */
var Children = {
	/**
	 * @param {*} children 
	 * @return {Array}
	 */
	toArray: function toArray (children) {
		var array = []

		if (children == null)
			return array
		else if (typeof children !== 'object')
			return [children]
		else if (children instanceof Array)
			array = children
		else if (typeof children.next === 'function')
			each(children, function (value) {
				array.push(value)
			})
		else if (typeof children[Iterator] === 'function')
			return this.toArray(child[Iterator]())

		return flatten(children, [])
	},
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @param {*} thisArg
	 */
	forEach: function forEach (children, callback, thisArg) {
		if (children != null)
			this.toArray(children).forEach(callback, thisArg)
	},
	/**
	 * @param {*} children
	 * @param {function} callback
	 * @return {Array}
	 */
	map: function map (children, callback, thisArg) {
		if (children != null)
			return this.toArray(children).map(callback, thisArg)
		else
			return children
	},
	/**
	 * @param {*} children 
	 * @return {Element}
	 */
	only: function only (children) {
		if (!isValidElement(children))
			invariant('Children.only', 'Expected to receive a single element')
		else
			return children
	},
	/**
	 * @param {*} children 
	 * @return {number}
	 */
	count: function count (children) {
		return this.toArray(children).length
	}
}
