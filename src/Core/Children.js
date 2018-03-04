/**
 * @type {Object}
 */
var Children = {
	toArray: arrayChildren,
	forEach: eachChildren,
	map: mapChildren,
	filter: filterChildren,
	find: findChildren,
	count: countChildren,
	only: onlyChildren
}

/**
 * @param {*} children
 * @return {Array}
 */
function arrayChildren (children) {
	var array = []

	if (children == null)
		return array
	if (isValidElement(children) || typeof children !== 'object')
		return [children]
	if (isArray(children))
		return flatten(children, array)
	if (typeof children[SharedLinkedNext] === 'function' || typeof children.forEach === 'function')
		each(children, function (element) {
			return array.push(element)
		})
	else if (typeof children[SymbolIterator] === 'function')
		return arrayChildren(children[SymbolIterator]())
	else
		array.push(children)

	return flatten(array, [])
}

/**
 * @param {*} children
 * @param {function} callback
 * @param {*} thisArg
 */
function eachChildren (children, callback, thisArg) {
	if (children != null)
		arrayChildren(children).forEach(callback, thisArg)
}

/**
 * @param {*} children
 * @param {function} callback
 * @return {Array}
 */
function mapChildren (children, callback, thisArg) {
	return children != null ? arrayChildren(children).map(callback, thisArg) : children
}

/**
 * @param {*} children
 * @param {function} callback
 * @param {*} thisArg
 */
function filterChildren (children, callback, thisArg) {
	return children != null ? arrayChildren(children).filter(callback, thisArg) : children
}

/**
 * @param {*} children
 * @param {function} callback
 * @param {*} thisArg
 */
function findChildren (children, callback, thisArg) {
	return children != null ? find(arrayChildren(children), callback, thisArg) : children
}

/**
 * @param {*} children
 * @return {number}
 */
function countChildren (children) {
	return arrayChildren(children).length
}

/**
 * @param {*} children
 * @return {Element?}
 */
function onlyChildren (children) {
	return isValidElement(children) ? children : invariant('Children.only', 'Expected to receive a single element')
}
