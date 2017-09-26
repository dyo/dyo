/**
 * @param {*} value
 * @return {string}
 */
function getTextEscape (value) {
	return (value+'').replace(RegExpEscape, getTextEncode)
}

/**
 * @param {string} character
 * @return {string}
 */
function getTextEncode (character) {
	switch (character) {
		case '<':
			return '&lt;'
		case '>':
			return '&gt;'
		case '"':
			return '&quot;'
		case "'":
			return '&#x27;'
		case '&':
			return '&amp;'
	}
}

/**
 * @param {string}
 */
function getElementType (type) {
	switch ((type+'').toLowerCase()) {
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
		case '!doctype':
			return SharedElementEmpty
		default:
			return SharedElementNode
	}
}

/**
 * @param {Response} response
 */
function setHeader (response) {
	if (typeof response.getHeader === 'function' && !response.getHeader('Content-Type'))
		response.setHeader('Content-Type', 'text/html')
}
