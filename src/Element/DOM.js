/**
 * DOM factory, create VNode factories
 *
 * @param {string[]} types
 */
function DOM (types) {
	var elements = {};

	// add element factories
	for (var i = 0, length = types.length; i < length; i++) {
		elements[types[i]] = VElement.bind(null, types[i]);
	}
	
	// if svg, add related svg element factories
	if (elements.svg) {
		var svgs = ['rect','path','polygon','circle','ellipse','line','polyline','svg',
			'g','defs','text','textPath','tspan','mpath','defs','g'];

		for (var i = 0, length = svgs.length; i < length; i++) {
			elements[svgs[i]] = VSvg.bind(null, svgs[i]);
		}
	}

	return elements;
}

