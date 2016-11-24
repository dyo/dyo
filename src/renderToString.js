/**
 * ---------------------------------------------------------------------------------
 * 
 * server-side (sync)
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * server side render
 * 
 * @param  {(Object|function)} subject
 * @param  {string}            template
 * @return {string}
 */
function renderToString (subject, template) {
	var styles = [''];
	var vnode  = retrieveVNode(subject);
	var lookup = {};
	var body   = renderVNodeToString(vnode, styles, lookup);
	var style  = styles[0];

	if (template) {
		if (typeof template === 'string') {
			return template.replace('{{body}}', body+style);
		} else {
			return template(body, style);
		}
	} else {
		return body+style;
	}
}


/**
 * render a VNode to string
 * 
 * @param  {Object} subject
 * @param  {str[1]} styles
 * @return {string}  
 */
function renderVNodeToString (subject, styles, lookup) {
	var vnode = subject.nodeType === 2 ? extractVNode(subject) : subject;
	var nodeType = vnode.nodeType;

	// textNode
	if (nodeType === 3) {
		return escape(vnode.children);
	}

	// references
	var component = subject.type;
	var type = vnode.type;
	var props = vnode.props;
	var children = vnode.children;

	var schildren = '';

	if (props.innerHTML) {
		// special case when a prop replaces children
		schildren = props.innerHTML;
	} else {		
		// construct children string
		if (children.length !== 0) {
			for (var i = 0, length = children.length; i < length; i++) {
				schildren += renderVNodeToString(children[i], styles, lookup);
			}
		}
	}

	var sprops = renderStylesheetToString(component, styles, renderPropsToString(props), lookup);

	if (nodeType === 11) {
		return schildren;
	} else if (isvoid[type]) {
		// <type ...props>
		return '<'+type+sprops+'>';
	} else {
		// <type ...props>...children</type>
		return '<'+type+sprops+'>'+schildren+'</'+type+'>';
	}
}


/**
 * render stylesheet to string
 * 
 * @param  {function}  component
 * @param  {string[1]} styles    
 * @param  {string}    string   
 * @return {string}          
 */
function renderStylesheetToString (component, styles, string, lookup) {
	// stylesheet
	if (component.stylesheet != null) {
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
		string += ' '+nsstyle+'='+'"'+component.id+'"';
	}

	return string;
}


/**
 * render props to string
 * 
 * @param  {Object} props
 * @param  {string} string
 * @return {string}
 */
function renderPropsToString (props) {
	var string = '';

	// construct props string
	if (props !== oempty && props !== null) {
		each(props, function (value, name) {
			// value --> <type name=value>, exclude props with undefined/null/false as values
			if (value != null && value !== false) {
				var type = typeof value;

				if (type === 'string' && value) {
					value = escape(value);
				}

				// do not process these props
				if (
					type !== 'function' &&
					name !== 'key' && 
					name !== 'ref' && 
					name !== 'innerHTML'
				) {
					if (type !== 'object') {
						if (name === 'className') { 
							name = 'class'; 
						}

						// if falsey/truefy checkbox=true ---> <type checkbox>
						string += ' ' + (value === true ? name : name + '="' + value + '"');
					} else {
						// if style objects
						var style = '';

						each(value, function (value, name) {
							// if camelCase convert to dash-case 
							// i.e marginTop --> margin-top
							if (name !== name.toLowerCase()) {
								name.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();
							}

							style += name + ':' + value + ';';
						});

						string += name + '="' + value + '"';
					}
				}
			}
		});
	}

	return string;
}

