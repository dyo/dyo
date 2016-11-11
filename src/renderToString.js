/**
 * ---------------------------------------------------------------------------------
 * 
 * server-side render
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
	var vnode;
	var store = [''];

	if (subject.type !== undefined) {
		vnode = subject;
	} else {			
		if (typeof subject === 'function') {
			vnode = VComponent(subject);
		} else {
			vnode = createElement('@', null, subject);
		}
	}

	if (template) {
		/*
			this allows to use this a full-feature template engine server-side
			i.e renderToString(Component, `
			<html>
					<head>
						<title>Home</title>
						{{style}}
					</head>
					<body>
						{{body}}
					</body>
				</html>
			`)
			styles will get rendered to {{style}}
			and the component/element/fragment to {{body}};			
		 */
		return template
					.replace('{{body}}', renderVNodeToString(vnode, store))
					.replace('{{style}}', store[0]);
	} else {
		return renderVNodeToString(vnode, null);
	}
}


/**
 * render a VNode to string
 * 
 * @param  {Object} subject
 * @param  {str[1]} store
 * @return {string}  
 */
function renderVNodeToString (subject, store) {
	var nodeType  = subject.nodeType;
	var vnode     = nodeType === 2 ? extractVNode(subject) : subject;

	// textNode
	if (nodeType === 3) {
		return vnode.children;
	}

	// references
	var component = subject.type,
		type      = vnode.type, 
		props     = vnode.props, 
		children  = vnode.children;

	var propsString    = '', 
		childrenString = '';

	// construct children string
	if (children.length === 0) {
		childrenString = '';
	} else {
		for (var i = 0, length = children.length; i < length; i++) {
			childrenString += renderVNodeToString(children[i], store);
		}
	}

	// construct props string
	if (props !== emptyObject && props !== null && typeof props === 'object') {
		each(props, function (value, name) {
			// value --> <type name=value>, exclude props with undefined/null/false as values
			if (value != null && value !== false) {
				var typeOfValue = typeof value;

				// do not add events, keys or refs
				if (name !== 'key' && name !== 'ref' && typeOfValue !== 'function') {
					if (typeOfValue !== 'object') {
						// textContent are special props that alter the rendered children
						if (name === 'textContent' || name === 'innerHTML') {
							childrenString = value;
						} else {
							if (name === 'className') { 
								name = 'class'; 
							}

							// if falsey/truefy checkbox=true ---> <type checkbox>
							propsString += ' ' + (value === true ? name : name + '="' + value + '"');
						}
					} else {
						// style objects, hoist regexp to convert camelCase to dash-case
						var styleString  = '', regexp = /([a-zA-Z])(?=[A-Z])/g;

						each(value, function (value, name) {
							// if camelCase convert to dash-case 
							// i.e marginTop --> margin-top
							if (name !== name.toLowerCase()) {
								name.replace(regexp, '$1-').toLowerCase();
							}

							styleString += name + ':' + value + ';';
						});

						propsString += name + '="' + value + '"';
					}
				}
			}
		});
	}

	// stylesheet
	if (store != null && component.stylesheet != null) {
		// this insures we only every create one 
		// stylesheet for every component with one
		if (component.output === undefined || component.output[0] !== '<') {
			store[0] += stylesheet(null, component);
		} else if (component.stylesheet === 0) {
			store[0] = component.output;
		}

		if (store[0] !== '') {
			propsString += ' '+styleNS+'='+'"'+component.id+'"';
		}
	}

	if (nodeType === 11) {
		return childrenString;
	} else if (voidElements[type] === 0) {
		// <type ...props>
		return '<'+type+propsString+'>';
	} else {
		// <type ...props>...children</type>
		return '<'+type+propsString+'>'+childrenString+'</'+type+'>';
	}
}