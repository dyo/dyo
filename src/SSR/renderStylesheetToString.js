/**
 * render stylesheet to string
 *
 * @param  {number}              nodeType
 * @param  {Component}           component
 * @param  {function}            constructor
 * @param  {string}              output   
 * @param  {Object<string, any>} lookup
 * @return {string}          
 */
function renderStylesheetToString (nodeType, component, constructor, output, lookup) {
	// stylesheet
	if (nodeType === 2) {
		// stylesheets
		if (component.stylesheet) {
			var id = component.stylesheet.styler;

			if (id === void 0) {
				// create
				lookup.styles += stylesheet(component, constructor)(null);
				lookup.ids[id = component.stylesheet.styler] = true;
			}
		 	else if (!lookup.ids[id]) {
				lookup.styles += component.stylesheet(null);
				lookup.ids[id] = true;
			}

			// add attribute to element
			output += ' '+nsStyle+'='+'"'+id+'"';
		}
	}

	return output;
}

