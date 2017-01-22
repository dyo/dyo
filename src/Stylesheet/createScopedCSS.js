/**
 * create scoped css
 * 
 * @param  {Component}       component
 * @param  {function}        constructor
 * @param  {boolean}         inject
 * @return {function(?Node)}
 */
function createScopedCSS (component, constructor, inject) {
	var namespace = component.displayName || constructor.name;
	var selector  = '['+nsStyle+'='+namespace+']';
	var css = component.stylesheet();
	var output = stylesheet(selector, css, true, true, null);

	if (browser && inject) {
		// obscure namesapce to avoid id/global namespace conflicts
		var id = '\''+namespace+'\'';

		// prevent duplicate styles when SSR outputs stylesheet
		if (document.getElementById(id) == null) {			
			var style = document.createElement('style');
			
			style.textContent = output;
			style.id = id;

			document.head.appendChild(style);
		}
	}

	/**
	 * decorator
	 * 
	 * @param  {?Node} DOMNode
	 * @return {(undefined|string)}
	 */
	function decorator (DOMNode) {
		// SSR
		if (DOMNode === null) {
			return output;
		}
		// DOM
		else {
			DOMNode.setAttribute(nsStyle, namespace);
		}
	}

	decorator.CSSNamespace = namespace;

	// replace stylesheet method for all instances with the style constructor `decorator`
	return component.stylesheet = constructor.prototype.stylesheet = decorator;
}

