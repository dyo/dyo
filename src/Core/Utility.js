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
List.prototype = Object.create(null, {
	constructor: {value: List},
	/**
	 * @param {Element} node
	 * @return {Element}
	 */
	remove: {value: function remove (node) {
		if (this.length < 1) return
		node.next.prev = node.prev
		node.prev.next = node.next
		this.length--
		return node
	}},
	/**
	 * @param {Element} node
	 * @param {Element} before
	 * @return {Element}
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
	 * @return {Element}
	 */
	pop: {value: function pop () {
		return this.remove(this.prev)
	}},
	/**
	 * @param {Element} node
	 * @return {Element}
	 */
	push: {value: function push (node) {
		return this.insert(node, this)
	}},
	/**
	 * @param {function} callback
	 */
	forEach: {value: function forEach (callback) {
		for (var i = 0, node = this; i < this.length; i++)
			callback.call(this, node = node.next, i)
	}}
})

/**
 * @constructor
 */
function Hash () {
	this.k = []
	this.v = []
}
/**
 * @type {Object}
 */
Hash.prototype = Object.create(null, {
	delete: {value: function (key) {
		var k = this.k
		var i = k.lastIndexOf(key)
		
		delete this.k[i]
		delete this.v[i]
	}},
	set: {value: function (key, value) {
		var k = this.k
		var i = k.lastIndexOf(key)

		k[!~i ? (i = k.length) : i] = key
		this.v[i] = value
	}},
	get: {value: function (key) {
		return this.v[this.k.lastIndexOf(key)]
	}},
	has: {value: function (key) {
		return this.k.lastIndexOf(key) > -1
	}}
})

/**
 * @param {Object} destination
 * @param {Object} source
 */
function merge (destination, source) {
	for (var key in source)
		destination[key] = source[key]
}

/**
 * @param {Object} destination
 * @param {Object} source
 * @param {Object} delta
 * @return {Object}
 */
function assign (destination, source, delta) {
	for (var key in source)
		destination[key] = source[key]
	
	for (var key in delta)
		destination[key] = delta[key]

	return destination
}

/**
 * @param {function} callback
 */
function setImmediate (callback) {
	requestAnimationFrame(callback, 16)
}

/**
 * @type {function}
 * @return {void}
 */
function noop () {}
