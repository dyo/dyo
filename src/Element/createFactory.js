/**
 * create element factory
 * 
 * @param  {string}  element
 * @return {function}
 */
function createFactory (type, props) {
	return props ? VElement.bind(null, type, props) : VElement.bind(null, type);
}