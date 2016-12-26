/**
 * stylesheet
 * 
 * @param  {Component}       component
 * @param  {function}        constructor
 * @return {function(?Node)} styler
 */
function stylesheet (component, constructor) {
	var styles = component.stylesheet();
	var id     = random(5);
	var css    = stylis('['+nsStyle+'='+id+']', styles, true, true);

	if (browser && document.getElementById(id) == null) {
		var style = document.createElement('style');
		
		style.textContent = css;
		style.id = id;

		document.head.appendChild(style);
	}

	function styler (element) {
		if (element === null) {
			return css;
		} else {
			element.setAttribute(nsStyle, id);
		}
	}

	styler.styler = id;

	return constructor.prototype.stylesheet = styler;
}

