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
			subject._html = renderToString(subject);
		} else if (subject.nodeType === 2 && subject.type._html === void 0) {
			subject.type._html = renderToString(subject);
		}
	}

	return subject;
}

