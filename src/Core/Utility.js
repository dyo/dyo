/**
 * @constructor
 */
function List () {
	this.next = this
	this.prev = this
	this.length = 0
}
/**
 * @param {Element} element
 * @param {Element} sibling
 * @return {Element}
 */
List.prototype.insert = function insert (element, sibling) {
	element.next = sibling
	element.prev = sibling.prev
	sibling.prev.next = element
	sibling.prev = element
	this.length++
	
	return element
}
/**
 * @param {Element} element
 * @return {Element}
 */
List.prototype.remove = function remove (element) {
	if (this.length < 1) 
		return
	
	element.next.prev = element.prev
	element.prev.next = element.next
	this.length--
	
	return element
}
/**
 * @return {Element}
 */
List.prototype.pop = function pop () {
	return this.remove(this.prev)
}
/**
 * @param {Element} element
 * @return {Element}
 */
List.prototype.push = function push (element) {
	return this.insert(element, this)
}
/**
 * @param {function} callback
 */
List.prototype.forEach = function forEach (callback) {
	for (var i = 0, element = this; i < this.length; i++)
		callback.call(this, element = element.next, i)
}

/**
 * @constructor
 */
function Hash () {
	this.k = []
	this.v = []
}
Hash.prototype.set = function set (key, value) {
	var k = this.k
	var i = k.lastIndexOf(key)

	k[i < 0 ? (i = k.length) : i] = key
	this.v[i] = value
}
Hash.prototype.get = function get (key) {
		return this.v[this.k.lastIndexOf(key)]
	}
Hash.prototype.has = function has (key) {
	return this.k.lastIndexOf(key) > -1
}

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
