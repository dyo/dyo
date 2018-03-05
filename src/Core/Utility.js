/**
 * @constructor
 */
function List () {
	this.next = this
	this.prev = this
	this.length = 0
}
/**
 * @type {Object}
 */
List[SharedSitePrototype] = {
	/**
	 * @param {Object} node
	 * @param {Object} before
	 * @return {Object}
	 */
	insert: function insert (node, before) {
		node.next = before
		node.prev = before.prev

		before.prev.next = node
		before.prev = node

		this.length++

		return node
	},
	/**
	 * @param {Object} node
	 * @return {Object}
	 */
	remove: function remove (node) {
		if (this.length === 0)
			return node

		node.next.prev = node.prev
		node.prev.next = node.next

		this.length--

		return node
	},
	/**
	 * @param {function} callback
	 */
	forEach: function forEach (callback) {
		for (var node = this, length = node.length; length > 0; --length)
			callback(node = node.next)
	}
}

/**
 * @constructor
 */
function WeakHash () {
	this.hash = ''
}
/**
 * @type {Object}
 */
WeakHash[SharedSitePrototype] = {
	/**
	 * @param {*} key
	 * @param {*} value
	 */
	set: function set (key, value) {
		key[this.hash] = value
	},
	/**
	 * @param {*} key
	 * @return {*}
	 */
	get: function get (key) {
		return key[this.hash]
	},
	/**
	 * @param {*} key
	 * @return {boolean}
	 */
	has: function has (key) {
		return this.hash in key
	}
}

/**
 * @return {void}
 */
function noop () {}

/**
 * @param {Object} object
 * @param {Object} primary
 */
function merge (object, primary) {
	for (var key in primary)
		object[key] = primary[key]

	return object
}

/**
 * @param {Object} object
 * @param {Object} primary
 * @param {Object} secondary
 * @return {Object}
 */
function assign (object, primary, secondary) {
	for (var key in primary)
		object[key] = primary[key]

	for (var key in secondary)
		object[key] = secondary[key]

	return object
}

/**
 * @param {Array} array
 * @param {Array} output
 * @return {Array}
 */
function flatten (array, output) {
	for (var i = 0; i < array.length; ++i)
		if (isArray(array[i]))
			flatten(array[i], output)
		else
			output.push(array[i])

	return output
}

/**
 * @param {Array} haystack
 * @param {function} callback
 * @param {*} thisArg
 */
function find (haystack, callback, thisArg) {
	if (typeof haystack.find === 'function')
		return haystack.find(callback, thisArg)

  for (var i = 0; i < haystack.length; ++i)
  	if (callback.call(thisArg, haystack[i], i, haystack))
  		return haystack[i]
}

/**
 * @param {Iterable} iterable
 * @param {function} callback
 */
function each (iterable, callback) {
	if (typeof iterable.forEach === 'function')
		return iterable.forEach(callback)

	var index = 0
	var value = iterable.next(value, index++)

	while (!value.done)
		value = iterable.next(value.value, index = callback(value.value, index))
}

/**
 * @param {string} from
 * @param {string} message
 */
function invariant (from, message) {
	throw new Error('#'+from+'(...): '+message+'.')
}

/**
 * @param {Object} a
 * @param {Object} b
 * @return {boolean}
 */
function compare (a, b) {
	for (var key in a)
		if (!hasOwnProperty.call(b, key))
			return true

	for (var key in b)
		if (!is(a[key], b[key]))
			return true

	return false
}

/**
 * @param {*} a
 * @param {*} b
 * @return {boolean}
 */
function is (a, b) {
	if (a === b)
		return a !== 0 || 1/a === 1/b

	return a !== a && b !== b
}

/**
 * @param {string} str
 * @return {number}
 */
function hash (str) {
	for (var i = 0, code = 0; i < str.length; ++i)
		code = ((code << 5) - code) + str.charCodeAt(i)

	return code >>> 0
}

/**
 * @param {function} callback
 * @return {number}
 */
function timeout (callback) {
	return setTimeout(function () {
		callback(now())
	}, 16)
}

/**
 * @return {boolean}
 */
function fetchable (object) {
	return (
		typeof object.blob === 'function' &&
		typeof object.text === 'function' &&
		typeof object.json === 'function'
	)
}

/**
 * @param {object} object
 * @return {boolean}
 */
function thenable (object) {
	return typeof object.then === 'function'
}
