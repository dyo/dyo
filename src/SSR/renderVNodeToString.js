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

	var vnode;

	// if component
	if (nodeType === 2) {
		// if cached
		if (subject.type._html !== void 0) {
			return subject.type._html;
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

	var childrenStr = '';

	if (props.innerHTML !== void 0) {
		// special case when a prop replaces children
		childrenStr = props.innerHTML;
	} else {		
		// construct children string
		if (children.length !== 0) {
			for (var i = 0, length = children.length; i < length; i++) {
				childrenStr += renderVNodeToString(children[i], styles, lookup);
			}
		}
	}

	var propsStr = renderStylesheetToString(
		nodeType, subject._owner, subject.type, styles, renderPropsToString(props), lookup
	);

	if (nodeType === 11) {
		return childrenStr;
	} else if (isVoid[type] === 0) {
		// <type ...props>
		return '<'+type+propsStr+'>';
	} else {
		// <type ...props>...children</type>
		return '<'+type+propsStr+'>'+childrenStr+'</'+type+'>';
	}
}

