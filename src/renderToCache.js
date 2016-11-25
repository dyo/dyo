/**
 * ---------------------------------------------------------------------------------
 * 
 * server-side (sync) cache
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * renderToCache
 * 
 * @param  {Object} subject
 * @return {Object} subject
 */
function renderToCache (subject) {
	if (subject != null) {
		// if array run all VNodes through VBlueprint
		if (subject.constructor === Array) {
			for (var i = 0, length = subject.length; i < length; i++) {
				renderToCache(subject[i]);
			}
		} else {
			// if a blueprint is not already constructed
			if (subject._html == null) {
				subject._html = renderToString(subject);
			}
		}
	}

	return subject;
}

