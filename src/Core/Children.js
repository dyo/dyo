/**
 * @name Children
 * @type {object}
 * @property {function} toArray
 * @property {function} forEach
 * @property {function} map
 * @property {function} filter
 * @property {function} find
 * @property {function} count
 * @property {function} only
 * @public
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
 * @alias Children#toArray
 * @memberof Children
 * @param {any} children
 * @return {Array<any>}
 * @public
 */
function arrayChildren (children) {
	var array = []

	iterate(children, function (children) {
		array.push(children)
	})

	return array
}

/**
 * @alias Children#each
 * @memberof Children
 * @param {any} children
 * @param {function} callback
 * @param {any} thisArg
 * @public
 */
function eachChildren (children, callback, thisArg) {
	if (children != null)
		arrayChildren(children).forEach(callback, thisArg)
}

/**
 * @alias Children#map
 * @memberof Children
 * @param {any} children
 * @param {function} callback
 * @return {Array<any>}
 * @public
 */
function mapChildren (children, callback, thisArg) {
	return children != null ? arrayChildren(children).map(callback, thisArg) : children
}

/**
 * @alias Children#filter
 * @memberof Children
 * @param {any} children
 * @param {function} callback
 * @param {any} thisArg
 * @public
 */
function filterChildren (children, callback, thisArg) {
	return children != null ? arrayChildren(children).filter(callback, thisArg) : children
}

/**
 * @alias Children#find
 * @memberof Children
 * @param {any} children
 * @param {function} callback
 * @param {any} thisArg
 * @public
 */
function findChildren (children, callback, thisArg) {
	return children != null ? find(arrayChildren(children), callback, thisArg) : children
}

/**
 * @alias Children#count
 * @memberof Children
 * @param {any} children
 * @return {number}
 * @public
 */
function countChildren (children) {
	return arrayChildren(children).length
}

/**
 * @throws {Error} if not a single valid element
 * @alias Children#only
 * @memberof Children
 * @param {any} children
 * @return {Element?}
 * @public
 */
function onlyChildren (children) {
	return isValidElement(children) ? children : invariant('Children.only', 'Expected to receive a single element')
}
