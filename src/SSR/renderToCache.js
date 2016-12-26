/**
 * renderToCache
 * 
 * @param  {Object} subject
 * @return {Object} subject
 */
function renderToCache (subject) {
	if (subject) {
		// array, run all VNodes through renderToCache
		if (subject.constructor === Array) {
			for (var i = 0, length = subject.length; i < length; i++) {
				renderToCache(subject[i]);
			}
		} else if (subject.nodeType === void 0) {
			subject.HTMLCache = renderToString(subject);
		} else if (subject.nodeType === 2) {
			subject.type.HTMLCache = renderToString(subject);
		}
	}

	return subject;
}

