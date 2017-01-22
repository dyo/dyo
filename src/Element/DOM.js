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
	
	// if svg, add related svg element factory
	if (elements.svg !== void 0) {
		elements.svg = createSvgShape.bind(null, 'svg');
	}

	return elements;
}

