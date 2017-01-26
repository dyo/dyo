/**
 * renderToCache
 *
 * @public
 * 
 * @param  {(VNode|VNode[]|Component)} subject
 * @return {(VNode|VNode[]|Component)} subject
 */
function renderToCache (subject) {
	if (subject != null) {
		// array
		if (subject.constructor === Array) {
			for (var i = 0, length = subject.length; i < length; i++) {
				renderToCache(subject[i]);
			}
		}
		// component
		else if (subject.Type === void 0) {
			subject.HTMLCache = renderToString(subject);
		}
		// vnode
		else if (subject.Type === 2) {
			subject.type.HTMLCache = renderToString(subject);
		}
	}

	return subject;
}

