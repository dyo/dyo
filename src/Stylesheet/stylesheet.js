/**
 * stylesheet
 * 
 * @param  {(Node|null)}   element
 * @param  {function}      component
 * @return {(string|void)}
 */
function stylesheet (component, constructor) {
	// retrieve stylesheet
	var styles = component.stylesheet();

	// generate unique id
	var id = random(6);

	// compile css
	var css = stylis('['+nsStyle+'='+id+']', styles, true, true);

	function styler (element) {
		if (element === null) {
			// cache for server-side rendering
			return css;
		} else {
			element.setAttribute(nsStyle, id);

			// avoid adding a style element when one is already present
			if (document.getElementById(id) == null) { 
				var style = document.createElement('style');
				
				style.textContent = css;
				style.id = id;

				document.head.appendChild(style);
			}
		}
	}

	styler.styler = true;
	styler.id = id;

	return constructor.prototype.stylesheet = styler;
}

