/**
 * @name List
 * @constructor
 * @property {object} next
 * @property {object} prev
 * @property {number} length
 */
function List () {
	this.next = this
	this.prev = this
	this.length = 0
}
ObjectDefineProperties(ObjectDefineProperty(List[SharedSitePrototype], SymbolForIterator, {value: SymbolForIterator}), {
	/**
	 * @alias List#insert
	 * @memberof List
	 * @type {function}
	 * @param {object} node
	 * @param {object} before
	 * @return {object}
	 */
	insert: {
		value: function insert (node, before) {
			node.next = before
			node.prev = before.prev

			before.prev.next = node
			before.prev = node

			this.length++

			return node
		}
	},
	/**
	 * @alias List#remove
	 * @memberof List
	 * @type {function}
	 * @param {object} node
	 * @return {object}
	 */
	remove: {
		value: function remove (node) {
			if (this.length === 0)
				return node

			node.next.prev = node.prev
			node.prev.next = node.next

			this.length--

			return node
		}
	},
	/**
	 * @alias List#forEach
	 * @memberof List
	 * @type {function}
	 * @param {function} callback
	 */
	forEach: {
		value: function forEach (callback) {
			for (var node = this, length = node.length; length > 0; --length)
				callback(node = node.next)
		}
	}
})

/**
 * @name WeakHash
 * @constructor
 * @property {symbol} hash
 */
function WeakHash () {
	this.hash = Symbol()
}
ObjectDefineProperties(WeakHash[SharedSitePrototype], {
	/**
	 * @alias WeakHash#set
	 * @memberof WeakHash
	 * @type {function}
	 * @param {any} key
	 * @param {any} value
	 */
	set: {
		value: function set (key, value) {
			key[this.hash] = value
		}
	},
	/**
	 * @alias WeakHash#get
	 * @memberof WeakHash
	 * @type {function}
	 * @param {any} key
	 * @return {any}
	 */
	get: {
		value: function get (key) {
			return key[this.hash]
		}
	},
	/**
	 * @alias WeakHash#has
	 * @memberof WeakHash
	 * @type {function}
	 * @param {any} key
	 * @return {boolean}
	 */
	has: {
		value: function has (key) {
			return this.hash in key
		}
	}
})

/**
 * @return {void}
 */
function noop () {}

/**
 * @param {object} object
 * @param {object} a
 */
function merge (object, a) {
	for (var key in a)
		object[key] = a[key]

	return object
}

/**
 * @param {object} object
 * @param {object} a
 * @param {object} b
 * @return {object}
 */
function assign (object, a, b) {
	for (var key in a)
		object[key] = a[key]

	for (var key in b)
		object[key] = b[key]

	return object
}

/**
 * @param {Array<any>} array
 * @param {Array<any>} output
 * @return {Array<any>}
 */
function flatten (array, output) {
	for (var i = 0; i < array.length; ++i)
		ArrayisArray(array[i]) ? flatten(array[i], output) : output.push(array[i])

	return output
}

/**
 * @param {Array<any>} haystack
 * @param {function} callback
 * @param {any} thisArg
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
 * @throws {Error}
 * @param {string} from
 * @param {string} message
 */
function invariant (from, message) {
	throw new Error('#'+from+'(...): '+message+'.')
}

/**
 * @param {object} a
 * @param {object} b
 * @return {boolean}
 */
function compare (a, b) {
	for (var key in a)
		if (!ObjectHasOwnProperty.call(b, key))
			return true

	for (var key in b)
		if (!is(a[key], b[key]))
			return true

	return false
}

/**
 * @param {any} a
 * @param {any} b
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
	return typeof object.then === 'function' && typeof object.catch === 'function'
}
