/**
 * assign style prop (un)/prefixed
 * 
 * @param {Object} style
 * @param {string} prop
 * @param {string} value
 */
function prefixStyle (style, prop, value) {
	// if !un-prefixed support
	if (style !== void 0 && style[prop] === void 0) {
		// chrome, safari, mozila, ie
		var vendors = ['webkit','Webkit','Moz','ms'];

		for (var i = 0, length = vendors.length; i < length; i++) {
			// vendor + capitalized ---> webkitAnimation
			prefixed = (
				vendors[i] + prop[0].toUpperCase() + prop.substr(1, prop.length)
			);

			// add prop if vendor prop exists
			if (style[prefixed] !== void 0) {
				style[prefixed] = value;
			}
		}
	} else {
		style[prop] = value;
	}
}