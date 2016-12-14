/**
 * server side render to string
 * 
 * @param  {(Object|function)}  subject
 * @param  {(string|function)=} template
 * @return {string}
 */
function renderToString (subject, template) {
	var lookup = {styles: '', ids: {}};
	var vnode  = retrieveVNode(subject);
	var body   = renderVNodeToString(vnode, lookup);
	var css    = lookup.styles;
	var style  = css.length !== 0 ? '<style>'+css+'<style>' : '';

	if (template) {
		if (typeof template === 'string') {
			return template.replace('@body', body, style);
		} else {
			return template(body, style);
		}
	} else {
		return body+style;
	}
}

