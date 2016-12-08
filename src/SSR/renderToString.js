/**
 * server side render to string
 * 
 * @param  {(Object|function)}  subject
 * @param  {(string|function)=} template
 * @return {string}
 */
function renderToString (subject, template) {
	var lookup = {};
	var styles = [''];
	var vnode  = retrieveVNode(subject);
	var body   = renderVNodeToString(vnode, styles, lookup);
	var style  = styles[0];

	if (template) {
		if (typeof template === 'string') {
			return template.replace('@body', body+style);
		} else {
			return template(body, style);
		}
	} else {
		return body+style;
	}
}

