/**
 * retrieve virtual node
 * 
 * @param  {(function|object)} subject
 * @return {VNode}
 */
function retrieveVNode (subject) {
	if (subject.type) {
		return subject;
	} else {
		return typeof subject === 'function' ? VComponent(subject) : createElement('@', null, subject);
	}
}

