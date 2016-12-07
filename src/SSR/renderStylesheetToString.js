/**
 * render stylesheet to string
 * 
 * @param  {function}  component
 * @param  {string[1]} styles    
 * @param  {string}    string   
 * @return {string}          
 */
function renderStylesheetToString (nodeType, component, styles, string, lookup) {
	// stylesheet
	if (nodeType === 2 && component.stylesheet != null) {
		// insure we only every create one 
		// stylesheet for every component
		if (component.css === void 0 || component.css[0] !== '<') {
			// initial build css
			styles[0] += stylesheet(null, component);
			lookup[component.id] = true;
		} else if (!lookup[component.id]) {
			styles[0] += component.css;
			lookup[component.id] = true;
		}

		// add attribute to element
		string += ' '+nsStyle+'='+'"'+component.id+'"';
	}

	return string;
}

