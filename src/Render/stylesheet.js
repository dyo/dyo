/**
 * ---------------------------------------------------------------------------------
 * 
 * stylesheet
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * stylesheet
 * 
 * @param  {(Node|null)}   element
 * @param  {function}      component
 * @return {(string|void)}
 */
function stylesheet (element, component) {
	var id;
	var css;
	var func = typeof component.stylesheet === 'function';

	// create stylesheet, executed once per component constructor(not instance)
	if (func) {
		// retrieve stylesheet
		var styles = component.stylesheet();

		// generate unique id
		id = random(6);

		// compile css
		css = stylis('['+nsStyle+'='+id+']', styles, true, true);

		// re-assign stylesheet to avoid this whole step for future instances
		component.stylesheet = 0;

		// cache the id and css 
		component.id = id;
		component.css = css;
	} else {
		// retrieve cache
		id = component.id;
		css = component.css;
	}

	if (element === null) {
		// cache for server-side rendering
		return component.css = '<style id="'+id+'">'+css+'</style>';
	} else {
		element.setAttribute(nsStyle, id);

		// create style element and append to head
		// only when stylesheet is a function
		// this insures we will only ever excute this once 
		// since we mutate the .stylesheet property to 0
		if (func) {
			// avoid adding a style element when one is already present
			if (document.getElementById(id) == null) { 
				var style = document.createElement('style');
				
				style.textContent = css;
				style.id = id;

				document.head.appendChild(style);
			}
		}
	}
}

