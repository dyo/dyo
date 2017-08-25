/**
 * @param {View} target
 */
function DOM (target) {
	return {target: target}
}

/**
 * @param {Element} element
 * @return {View}
 */
function DOMNode (element) {
	return element.DOM.target
}

/**
 * @param {View} target
 * @param {boolean}
 */
function DOMValid (target) {
	return target instanceof View
}

/**
 * @return {View}
 */
function DOMRoot () {

}

/**
 * @param {string} type
 * @param {EventListener} listener
 * @param {*} options
 */
function DOMEvent (type, listener, options) {
	DOMRoot().addEventListener(type, listener.handleEvent, listener)
}

/**
 * @param {string} type
 * @param {string} xmlns
 * @return {DOM}
 */
function DOMElement (type, xmlns) {
	switch (type) {
		default:
			return DOM(new View())
	}
}

/**
 * @param {(string|number)} value
 * @return {DOM}
 */
function DOMText (value) {
	return DOM(new Span())
}

/**
 * @param {Element} element
 * @param {string} name 
 * @param {*} value
 */
function DOMProperty (element, name, value) {
	DOMNode(element).set(name, value)
}

/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {boolean} xmlns
 * @param {number} hash
 * @param {number} signature
 */
function DOMAttribute (element, name, value, xmlns, hash, signature) {
	switch (name) {

	}
}


/**
 * @param {Element} element
 * @param {string} name
 * @param {*} value
 * @param {number} signature
 */
function DOMStyle (element, name, value, signature) {

}

/**
 * @param {Element} element
 */
function DOMContent (element) {

}

/**
 * @param {Element} element
 * @param {(string|number)} value
 */
function DOMValue (element, value) {
	DOMNode(element).text = value
}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMRemove (element, parent) {

}

/**
 * @param {Element} element
 * @param {Element} sibling
 * @param {Element} parent
 */
function DOMInsert (element, sibling, parent) {

}

/**
 * @param {Element} element
 * @param {Element} parent
 */
function DOMAppend (element, parent) {

}
