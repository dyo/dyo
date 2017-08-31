/**
 * @param {Element} element
 * @return {Element}
 */
function elementComponent (element) {
	componentMount(element)

	if (element.owner[LifecycleChildContext])
		element.context = getChildContext(element)
	
	return element.children
}

/**
 * @param {*} value
 * @return {string}
 */
function escapeText (value) {
	return (value+'').replace(RegExpEscape, encodeText)
}

/**
 * @param {string} character
 * @return {string}
 */
function encodeText (character) {
	switch (character) {
		case '<': return '&lt;'
		case '>': return '&gt;'
		case '"': return '&quot;'
		case "'": return '&#x27;'
		case '&': return '&amp;'
		default: return character
	}
}

/**
 * @param {string}
 */
function elementType (type) {
	switch (type) {
		case 'area':
		case 'base':
		case 'br':
		case 'meta':
		case 'source':
		case 'keygen':
		case 'img':
		case 'col':
		case 'embed':
		case 'wbr':
		case 'track':
		case 'param':
		case 'link':
		case 'input':
		case 'hr':
		case '!doctype': return 0
		default: return 1
	}
}

/**
 * @param {Response} response
 */
function setHeader (response) {
	if (typeof response.getHeader === 'function' && !response.getHeader('Content-Type'))
		response.setHeader('Content-Type', 'text/html')
}
