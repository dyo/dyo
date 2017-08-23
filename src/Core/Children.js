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
	else
		return children
}

/**
 * @param {*} children 
 * @return {Array}
 */
function childrenArray (children) {
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
		return childrenArray(child[Iterator]())

	return flatten(children, [])
}

/**
 * @param {*} children 
 * @return {Element}
 */
function childrenOnly (children) {
	if (!isValidElement(children))
		invariant('Children.only', 'Expected to receive a single element')
	else
		return children
}

/**
 * @param {*} children 
 * @return {number}
 */
function childrenCount (children) {
	return toArray(children).length
}

/**
 * @type {Object}
 */
var Children = {
	toArray: childrenArray,
	forEach: childrenEach, 
	map: childrenMap,
	count: childrenCount,
	only: childrenOnly
}
