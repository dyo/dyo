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
		else if (isValidElement(children) || typeof children !== 'object')
			return [children]
		else if (children instanceof Array)
			array = children
		else if (typeof children.next === 'function')
			each(children, function (value) {
				array.push(value)
			})
		else if (typeof children[SymbolIterator] === 'function')
			return this.toArray(child[SymbolIterator]())
		else
			return [children]

		return flatten(array, [])
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

		return children
	},
	/**
	 * @param {*} children 
	 * @return {Element}
	 */
	only: function only (children) {
		if (isValidElement(children))
			return children
		
		invariant('Children.only', 'Expected to receive a single element')
	},
	/**
	 * @param {*} children 
	 * @return {number}
	 */
	count: function count (children) {
		return this.toArray(children).length
	}
}
