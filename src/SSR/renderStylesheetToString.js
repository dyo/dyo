/**
 * render stylesheet to string
 *
 * @param  {number}              nodeType
 * @param  {string}              type
 * @param  {Component}           component
 * @param  {function}            constructor
 * @param  {string}              output   
 * @param  {Object<string, any>} lookup
 * @return {string}          
 */
function renderStylesheetToString (nodeType, type, component, constructor, output, lookup) {
	// stylesheet
	if (nodeType === 2 && type !== 'noscript') {
		// stylesheet
		if (component.stylesheet) {
			var namespace = component.stylesheet.CSSNamespace;

			// create
			if (namespace === void 0) {
				var decorator = createScopedCSS(component, constructor.COMPCache || constructor, false);

				lookup.namespaces[namespace = decorator.CSSNamespace] = true;			
				lookup.styles += '<style id="\''+namespace+'\'">'+decorator(null)+'</style>';
			}
			// cache
		 	else if (!lookup.namespaces[namespace]) {
		 		lookup.namespaces[namespace] = true;
				lookup.styles += '<style id="\''+namespace+'\'">'+component.stylesheet(null)+'</style>';
			}

			// add attribute to element
			output += ' '+nsStyle+'='+'"'+namespace+'"';
		}
	}

	return output;
}

