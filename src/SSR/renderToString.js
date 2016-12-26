/**
 * server side render to string
 * 
 * @param  {(Object|function)}  subject
 * @param  {(string|function)=} template
 * @return {string}
 */
function renderToString (subject, template) {
	var lookup = {styles: '', ids: {}};
	var body   = renderVNodeToString(renderVNode(subject), lookup, true);
	var styles = lookup.styles;
	var style  = styles.length !== 0 ? '<style>'+styles+'<style>' : '';

	if (template) {
		if (typeof template === 'string') {
			return template.replace('@body', body+style);
		} else {
			return template(body, styles);
		}
	} else {
		return body+style;
	}
}

