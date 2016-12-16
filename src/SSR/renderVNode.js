/**
 * render virtual node
 * 
 * @param  {(function|Object)} subject
 * @return {VNode}
 */
function renderVNode (subject) {
	if (subject.type) {
		return subject;
	} else {
		return typeof subject === 'function' ? VComponent(subject) : createElement('@', null, subject);
	}
}

