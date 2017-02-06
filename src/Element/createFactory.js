/**
 * create element factory
 * 
 * @param  {string}              type
 * @param  {Object<string, any>} props
 * @return {createElement(?Object<string>, ...any=)}
 */
function createFactory (type, props) {
	return props != null ? createElement.bind(null, type, props) : createElement.bind(null, type);
}