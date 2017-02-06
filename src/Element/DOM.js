/**
 * DOM factory, create vnode factories
 *
 * @public
 * 
 * @param  {string[]}                 types
 * @return {Object<string, function>} elements
 */
function DOM (types) {
	var elements = {};

	// add element factories
	for (var i = 0, length = types.length; i < length; i++) {
		elements[types[i]] = createElementShape.bind(null, types[i]);
	}

	return elements;
}

