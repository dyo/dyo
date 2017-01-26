/**
 * create virtual element
 *
 * @public
 * 
 * @param  {(string|function|Component)} type
 * @param  {Object<string, any>=}        props
 * @param  {...any=}                     children
 * @return {Object<string, any>}
 */
function createElement (type, props) {
	if (type == null) {
		return createEmptyShape();
	}

	var length = arguments.length;
	var children = [];
	var position = 2;

	// if props is not a normal object
	if (props == null || props.constructor !== Object || props.props !== void 0) {
		// update position if props !== null
		if (props !== null) {
			props = null;
			position = 1; 
		}
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
					// add array child
					for (var j = 0, len = child.length; j < len; j++) {
						index = createChild(child[j], children, index);
					}
				}
				else {
					index = createChild(child, children, index);
				}
			}
		}
	}

	var typeOf = typeof type;

	if (typeOf === 'string') {
		// fragment
		if (type === '@') {
			return createFragmentShape(children);
		}
		// element
		else {
			if (props === null) {
				props = {};
			}

			// if props.xmlns is undefined and type === 'svg' or 'math' 
			// assign svg && math namespaces to props.xmlns
			if (props.xmlns === void 0) {	
				if (type === 'svg') { 
					props.xmlns = nsSvg; 
				}
				else if (type === 'math') { 
					props.xmlns = nsMath; 
				}
			}

			return createElementShape(type, props, children);
		}
	}
	// component
	else if (typeOf === 'function') {
		return createComponentShape(type, props, children);
	}
	// hoisted
	else if (type.Type) {
		return cloneElement(type, props, children);
	}
	// portal
	else if (type.nodeType !== void 0) {
		return createPortalShape(type, props || objEmpty, children);
	}
	// fragment
	else {
		return createElement('@', null, type);
	}
}

