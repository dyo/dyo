/**
 * @type {Object}
 */
var Children = {
	toArray: childrenArray,
	forEach: childrenEach,
	map: childrenMap,
	filter: childrenFilter,
	find: childrenFind,
	count: childrenCount,
	only: childrenOnly
}

/**
 * @param {*} children
 * @return {Array}
 */
function childrenArray (children) {
	var array = []

	if (children == null)
		return array
	if (isValidElement(children) || typeof children !== 'object')
		return [children]
	if (isArray(children))
		return flatten(children, array)
	if (typeof children.next === 'function' || typeof children.forEach === 'function')
		each(children, function (element) {
			return array.push(element)
		})
	else if (typeof children[SymbolIterator] === 'function')
		return childrenArray(children[SymbolIterator]())
	else
		array.push(children)

	return flatten(array, [])
}

/**
 * @param {*} children
 * @param {function} callback
 * @param {*} thisArg
 */
function childrenEach (children, callback, thisArg) {
	if (children != null)
		childrenArray(children).forEach(callback, thisArg)
}

/**
 * @param {*} children
 * @param {function} callback
 * @return {Array}
 */
function childrenMap (children, callback, thisArg) {
	if (children != null)
		return childrenArray(children).map(callback, thisArg)

	return children
}

/**
 * @param {*} children
 * @param {function} callback
 * @param {*} thisArg
 */
function childrenFilter (children, callback, thisArg) {
	if (children != null)
		return childrenArray(children).filter(callback, thisArg)

	return children
}

/**
 * @param {*} children
 * @param {function} callback
 * @param {*} thisArg
 */
function childrenFind (children, callback, thisArg) {
	if (children != null)
		return find(childrenArray(children), callback, thisArg)

	return children
}

/**
 * @param {*} children
 * @return {number}
 */
function childrenCount (children) {
	return childrenArray(children).length
}

/**
 * @param {*} children
 * @return {Element}
 */
function childrenOnly (children) {
	if (isValidElement(children))
		return children

	invariant('Children.only', 'Expected to receive a single element')
}
