/**
 * server side render to string
 *
 * @public
 * 
 * @param  {(Object|function)}  subject
 * @param  {(string|function)=} template
 * @return {string}
 */
function renderToString (subject, template) {
	var lookup = {styles: '', namespaces: {}};
	var body   = renderVNodeToString(renderVNode(subject), lookup, true);
	var styles = lookup.styles;
	var style  = styles.length !== 0 ? styles : '';

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

