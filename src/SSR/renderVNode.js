/**
 * render virtual node
 * 
 * @param  {(VNode|function|Component)} subject
 * @return {VNode}
 */
function renderVNode (subject) {
	if (subject.nodeType) {
		return subject;
	} else {
		return typeof subject === 'function' ? VComponent(subject) : createElement('@', null, subject);
	}
}

