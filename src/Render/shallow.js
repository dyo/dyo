/**
 * shallow render
 *
 * @param  {(VNode|Component)}
 * @return {VNode}
 */
function shallow (subject) {
	if (isValidElement(subject)) {
		return subject.nodeType === 2 ? extractComponent(subject) : subject;
	} else {
		return extractComponent(createElement(subject, null, null));
	}
}

