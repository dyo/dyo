/**
 * renderToCache
 * 
 * @param  {Object} subject
 * @return {Object} subject
 */
function renderToCache (subject) {
	if (subject != null && server) {
		// if array run all VNodes through renderToCache
		if (subject.constructor === Array) {
			for (var i = 0, length = subject.length; i < length; i++) {
				renderToCache(subject[i]);
			}
		} else if (subject._html == null) {
			subject._html = renderToString(subject);
		}
	}

	return subject;
}

