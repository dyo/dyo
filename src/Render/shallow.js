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
		return subject.Type === 2 ? extractComponentNode(subject) : subject;
	}
	else {
		return extractComponentNode(createElement(subject, null, null));
	}
}

