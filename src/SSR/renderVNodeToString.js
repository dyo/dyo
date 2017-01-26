/**
 * render a VNode to string
 * 
 * @param  {VNode}               subject
 * @param  {Object<string, any>} lookup
 * @param  {boolean}             initial
 * @return {string}  
 */
function renderVNodeToString (subject, lookup, initial) {
	var nodeType = subject.Type;

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
		} 
		else {
			vnode = extractComponentNode(subject);
		}
	} 
	else {
		vnode = subject;
	}

	// references
	var type = vnode.type;
	var props = vnode.props;
	var children = vnode.children;

	var childrenString = '';
	var vnodeString = '';

	if (props.innerHTML !== void 0) {
		// special case when a prop replaces children
		childrenString = props.innerHTML;
	}
	else {		
		// construct children string
		if (children.length !== 0) {
			for (var i = 0, length = children.length; i < length; i++) {
				childrenString += renderVNodeToString(children[i], lookup, false);
			}
		}
	}

	var propsStr = renderStylesheetToString(
		nodeType, type, subject.instance, subject.type, renderPropsToString(vnode), lookup
	);

	if (isVoid[type] === 0) {
		// <type ...props>
		vnodeString = '<'+type+propsStr+'>';
	}
	else {
		// <type ...props>...children</type>
		vnodeString = '<'+type+propsStr+'>'+childrenString+'</'+type+'>';
	}

	// add doctype if initial element is <html>
	return initial && type === 'html' ? ('<!doctype html>' + vnodeString) : vnodeString;
}

