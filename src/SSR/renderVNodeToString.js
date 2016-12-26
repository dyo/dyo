/**
 * render a VNode to string
 * 
 * @param  {VNode}               subject
 * @param  {Object<string, any>} lookup
 * @param  {boolean}             initial
 * @return {string}  
 */
function renderVNodeToString (subject, lookup, initial) {
	var nodeType = subject.nodeType;

	// textNode
	if (nodeType === 3) {
		return escape(subject.children);
	}

	var vnode;

	// if component
	if (nodeType === 2) {
		// if cached
		if (subject.type.HTMLCache !== void 0) {
			return subject.type.HTMLCache;
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
	var vnodeStr = '';

	if (props.innerHTML !== void 0) {
		// special case when a prop replaces children
		childrenStr = props.innerHTML;
	} else {		
		// construct children string
		if (children.length !== 0) {
			for (var i = 0, length = children.length; i < length; i++) {
				childrenStr += renderVNodeToString(children[i], lookup, false);
			}
		}
	}

	var propsStr = renderStylesheetToString(
		nodeType, subject.instance, subject.type, renderPropsToString(props), lookup
	);

	if (vnode.nodeType === 11) {
		vnodeStr = childrenStr;
	} else if (isVoid[type] === 0) {
		// <type ...props>
		vnodeStr = '<'+type+propsStr+'>';
	} else {
		// <type ...props>...children</type>
		vnodeStr = '<'+type+propsStr+'>'+childrenStr+'</'+type+'>';
	}

	// add doctype if initial element is <html>
	if (initial && type === 'html') {
		vnodeStr = '<!doctype html>' + vnodeStr;
	}

	return vnodeStr;
}

