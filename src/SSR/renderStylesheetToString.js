/**
 * render stylesheet to string
 *
 * @param  {number}                  nodeType
 * @param  {Component}               component
 * @param  {function}                constructor
 * @param  {string[1]}               styles    
 * @param  {string}                  output   
 * @param  {Object<string, boolean>} lookup
 * @return {string}          
 */
function renderStylesheetToString (nodeType, component, constructor, styles, output, lookup) {
	// stylesheet
	if (nodeType === 2) {
		// stylesheets
		if (component.stylesheet) {
			if (component.stylesheet.styler !== true) {
				// create
				styles[0] += stylesheet(component, constructor)(null);
				lookup[component.stylesheet.id] = true;
			}
		 	else if (!lookup[component.stylesheet.id]) {
				styles[0] += component.stylesheet(null);
				lookup[component.stylesheet.id] = true;
			}
		}

		// add attribute to element
		output += ' '+nsStyle+'='+'"'+component.stylesheet.id+'"';
	}

	return output;
}

