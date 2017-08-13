/**
 * @param {*} value
 * @return {string}
 */
function escape (value) {
	return (value+'').replace(/[<>&"']/g, encode)
}

/**
 * @param {string} character
 * @return {string}
 */
function encode (character) {
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
function bool (name) {
	switch (name) {
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
		default: return 2
	}
}
