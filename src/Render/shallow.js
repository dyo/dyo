/**
 * shallow render
 *
 * @public
 * 
 * @param  {(VNode|Component|function)}
 * @return {VNode}
 */
function shallow (subject) {
	if (isValidElement(subject)) {
		return subject.nodeType === 2 ? extractComponentNode(subject) : subject;
	}
	else {
		return extractComponentNode(createElement(subject, null, null));
	}
}

