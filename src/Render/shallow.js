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
		return subject.Type === 2 ? extractComponentNode(subject, null, null) : subject;
	}
	else {
		return extractComponentNode(createElement(subject, null, null), null, null);
	}
}

