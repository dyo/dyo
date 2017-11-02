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
defineProperties(List.prototype, {
	/**
	 * @param {Object} node
	 * @param {Object} before
	 * @return {Object}
	 */
	insert: {value: function insert (node, before) {
		node.next = before
		node.prev = before.prev
		before.prev.next = node
		before.prev = node
		this.length++

		return node
	}},
	/**
	 * @param {Object} node
	 * @return {Object}
	 */
	remove: {value: function remove (node) {
		if (this.length === 0)
			return node

		node.next.prev = node.prev
		node.prev.next = node.next
		this.length--

		return node
	}},
	/**
	 * @param {function} callback
	 */
	forEach: {value: function forEach (callback) {
		for (var i = 0, node = this; i < this.length; ++i)
			callback(node = node.next, i)
	}}
})

/**
 * @constructor
 */
function WeakHash () {
	this.hash = ''
}
/**
 * @type {Object}
 */
defineProperties(WeakHash.prototype, {
	/**
	 * @param {*} key
	 * @param {*} value
	 */
	set: {value: function set (key, value) {
		key[this.hash] = value
	}},
	/**
	 * @param {*} key
	 * @return {*}
	 */
	get: {value: function get (key) {
		return key[this.hash]
	}},
	/**
	 * @param {*} key
	 * @return {boolean}
	 */
	has: {value: function has (key) {
		return this.hash in key
	}}
})

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
 * @param {Iterable} iterable
 * @param {function} callback
 */
function each (iterable, callback) {
	if (iterable.forEach)
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
