/**
 * Render
 *
 * @param {Any} subject
 * @param {Node?} container
 * @param {(Function|Node)?} callback
 */
function render (subject, container, callback) {
	var newer = subject;
	var target = container;

	if (newer === void 0 || newer === null) {
		newer = text('');
	} else if (newer.flag === void 0) {
		newer = shape(newer, null, false);
	}

	// browser
	if (target === void 0 || target === null) {
		// uses <body> if it exists at this point
		// else default to the root <html> node
		if (body === null && (body = documentElement()) === null) {
			switch (server) {
				case true: return newer.toString();
				case false: return;
			}
		}

		target = body;
	}

	var older = target.this;

	if (older !== void 0) {
		if (older.key === newer.key) {
			patch(older, newer, older.group);
		} else {
			exchange(older, newer, true);
		}
	} else {
		var parent = new Tree(ELEMENT);

		target.this = older = newer;
		parent.node = target;

		if (callback === void 0 || callback === null || callback.constructor === Function) {
			create(newer, parent, SHARED, 1, newer, null);
		} else {
			hydrate(newer, parent, 0, callback, newer, null);
		}
	}

	if (callback !== void 0 && callback !== null && callback.constructor === Function) {
		callbackBoundary(older, older.owner, callback, target, 0);
	}
}
