/**
 * render a VNode to string
 * 
 * @param  {Object} subject
 * @param  {str[1]} styles
 * @return {string}  
 */
function renderVNodeToString (subject, styles, lookup) {
	var nodeType = subject.nodeType;

	// textNode
	if (nodeType === 3) {
		return escape(subject.children);
	}

	var component = subject.type;
	var vnode;

	// if component
	if (nodeType === 2) {
		// if cached
		if (component._html !== void 0) {
			return component._html;
		} else {
			vnode = extractComponent(subject);
		}
	} else {
		vnode = subject;
	}

	// references
	var type = vnode.type;
	var props = vnode.props;
	var children = vnode.children;

	var strChildren = '';

	if (props.innerHTML !== void 0) {
		// special case when a prop replaces children
		strChildren = props.innerHTML;
	} else {		
		// construct children string
		if (children.length !== 0) {
			for (var i = 0, length = children.length; i < length; i++) {
				strChildren += renderVNodeToString(children[i], styles, lookup);
			}
		}
	}

	var strProps = renderStylesheetToString(nodeType, component, styles, renderPropsToString(props), lookup);

	if (nodeType === 11) {
		return strChildren;
	} else if (isVoid[type] === 0) {
		// <type ...props>
		return '<'+type+strProps+'>';
	} else {
		// <type ...props>...children</type>
		return '<'+type+strProps+'>'+strChildren+'</'+type+'>';
	}
}

