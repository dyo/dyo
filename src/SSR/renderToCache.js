/**
 * renderToCache
 *
 * @public
 * 
 * @param  {(VNode|VNode[]|Component)} subject
 * @return {(VNode|VNode[]|Component)} subject
 */
function renderToCache (subject) {
	if (subject) {
		// array, run all VNodes through renderToCache
		if (subject.constructor === Array) {
			for (var i = 0, length = subject.length; i < length; i++) {
				renderToCache(subject[i]);
			}
		}
		// Component
		else if (subject.nodeType === void 0) {
			subject.HTMLCache = renderToString(subject);
		}
		// VNode
		else if (subject.nodeType === 2) {
			subject.type.HTMLCache = renderToString(subject);
		}
	}

	return subject;
}

