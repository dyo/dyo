/**
 * @param {Node} target
 */
function DOM (target) {
	return {target: target}
}

/**
 * @param {Element} element
 * @return {Node}
 */
function DOMNode (element) {
	return element.DOM.target
}

/**
 * @param {Node} target
 * @param {boolean}
 */
function DOMValid (target) {

}

/**
 * @return {Node}
 */
function DOMRoot () {

}

/**
 * @param {string} type
 * @param {EventListener} listener
 * @param {*} options
 */
function DOMEvent (type, listener, options) {

}

/**
 * @param {string} type
 * @param {string} xmlns
 * @return {DOM}
 */
function DOMElement (type, xmlns) {

}

/**
 * @param {(string|number)} value
 * @return {DOM}
 */
function DOMText (value) {

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
