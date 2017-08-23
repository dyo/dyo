/**
 * @constructor
 */
function List () {
	this.next = this
	this.prev = this
	this.length = 0
}
List.prototype = Object.create(null, {
	constructor: {value: List},
	/**
	 * @param {Element} element
	 * @param {Element} sibling
	 * @return {Element}
	 */
	insert: {value: function insert (element, sibling) {
		element.next = sibling
		element.prev = sibling.prev
		sibling.prev.next = element
		sibling.prev = element
		this.length++
		
		return element
	}},
	/**
	 * @param {Element} element
	 * @return {Element}
	 */
	remove: {value: function remove (element) {
		if (this.length < 1) 
			return
		
		element.next.prev = element.prev
		element.prev.next = element.next
		this.length--
		
		return element
	}},
	/**
	 * @return {Element}
	 */
	pop: {value: function pop () {
		return this.remove(this.prev)
	}},
	/**
	 * @param {Element} element
	 * @return {Element}
	 */
	push: {value: function push (element) {
		return this.insert(element, this)
	}},
	/**
	 * @param {function} callback
	 */
	forEach: {value: function forEach (callback) {
		for (var i = 0, element = this; i < this.length; i++)
			callback.call(this, element = element.next, i)
	}}
})

/**
 * @constructor
 */
function Hash () {
	this.hash = ''
}
Hash.prototype = Object.create(null, {
	/**
	 * @param  {*} key
	 * @param  {*} value
	 * @return {Hash}
	 */
	set: {value: function set (key, value) {
		key[this.hash] = value
	}},
	/**
	 * @param  {*} key
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
