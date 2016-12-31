/**
 * DOM factory, create VNode factories
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
		elements[types[i]] = VElement.bind(null, types[i]);
	}
	
	// if svg, add related svg element factories
	elements.svg !== void 0 && (elements.svg = VSvg.bind(null, 'svg'));

	return elements;
}

