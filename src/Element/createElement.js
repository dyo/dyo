/**
 * create virtual element
 * 
 * @param  {(string|function|Object)} type
 * @param  {Object=}                  props
 * @param  {...*=}                    children
 * @return {Object}
 */
function createElement (type, props) {
	var length   = arguments.length;
	var children = [];
	var position = 2;

	// if props is not a normal object
	if (props == null || props.nodeType !== void 0 || props.constructor !== Object) {
		// update position if props !== undefined|null
		// this assumes that it would look like
		// createElement('type', null, ...children);
		if (props !== null) {
			position = 1; 
		}

		// default
		props = {};
	}

	if (length !== 1) {
		var index = 0;

		// construct children
		for (var i = position; i < length; i++) {
			var child = arguments[i];
			
			// only add non null/undefined children
			if (child != null) {
				// if array, flatten
				if (child.constructor === Array) {
					var len = child.length;

					// add array child
					for (var j = 0; j < len; j++) {
						children[index++] = createChild(child[j]);
					}
				} else {
					children[index++] = createChild(child);
				}
			}
		}
	}

	// if type is a function, create component VNode
	if (typeof type === 'function') {
		return VComponent(type, props, children);
	} else {
		// if first letter = @, create fragment VNode, else create element VNode
		var element = type[0] === '@' ? VFragment(children) : VElement(type, props, children);

		// special type, i.e [type] | div.class | #id
		if ((type.indexOf('.') > -1 || type.indexOf('[') > -1 || type.indexOf('#') > -1)) {
			parseVNodeType(type, props || {}, element);
		}

		// if props.xmlns is undefined  and type === svg|math 
		// assign svg && math namespaces to props.xmlns
		if (element.props.xmlns === void 0) {	
			if (type === 'svg') { 
				element.props.xmlns = nsSvg; 
			} else if (type === 'math') { 
				element.props.xmlns = nsMath; 
			}
		}

		return element;
	}
}


/**
 * create virtual child
 * 
 * @param  {*} child
 */
function createChild (child) {
	if (child != null && child.nodeType !== void 0) {
		// default element
		return child;
	} else if (typeof child === 'function') {
		// component
		return VComponent(child);
	} else {
		// primitives, string, bool, number
		return VText(child);
	}
}

