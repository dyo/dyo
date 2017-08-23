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
		for (var i = 0, element = this; i < this.length; ++i)
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
	for (var i = 0; i < array.length; ++i) {
		if (array[i] instanceof Array)
			flatten(array[i], output)
		else
			output.push(array[i])
	}
	
	return output
}

/**
 * @param {Iterable} iterable
 * @param {function} callback
 */
function each (iterable, callback) {
	var value = iterable.next()

	while (value.done !== true) {
		callback(value.value)
		value = iterable.next(value.value)
	}
}

/**
 * @param {function} callback
 */
function enqueue (callback) {
	requestAnimationFrame(callback, 16)
}

/**
 * @param {string} from
 * @param {string} message
 */
function invariant (from, message) {
	throw new Error('#'+from+'(...): '+message+'.')
}
