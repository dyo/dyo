/**
 * @type {Object}
 */
var Children = {
	toArray: childrenArray,
	forEach: childrenEach,
	count: childrenCount,
	only: childrenOnly,
	map: childrenMap
}

/**
 * @param {*} children 
 * @return {Array}
 */
function childrenArray (children) {
	var array = []

	if (children == null)
		return array
	else if (isValidElement(children) || typeof children !== 'object')
		return [children]
	else if (isArray(children))
		return flatten(children, array)
	else if (typeof children[SymbolIterator] === 'function')
		return childrenArray(child[SymbolIterator]())
	else if (typeof children.next === 'function' || children instanceof List)
		each(children, function (element) {
			return array.push(element)
		})

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
