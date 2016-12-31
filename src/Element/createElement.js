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
	var length   = arguments.length;
	var children = [];
	var position = 2;

	// if props is not a normal object
	if (props == null || props.nodeType !== void 0 || props.constructor !== Object) {
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
				} else {
					index = createChild(child, children, index);
				}
			}
		}
	}

	// if type is a function, create component VNode
	if (typeof type === 'function') {
		return VComponent(type, props, children);
	} 
	else if (type === '@') {
		return VFragment(children);
	} 
	else {
		if (props === null) {
			props = {};
		}

		// if props.xmlns is undefined and type === 'svg' or 'math' 
		// assign svg && math namespaces to props.xmlns
		if (props.xmlns === void 0) {	
			if (type === 'svg') { 
				props.xmlns = nsSvg; 
			} else if (type === 'math') { 
				props.xmlns = nsMath; 
			}
		}

		return VElement(type, props, children);
	}
}

