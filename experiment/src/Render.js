/**
 * Render
 *
 * @param {Any} subject
 * @param {Node?} container
 * @param {(Function|String)?} callback
 */
function render (subject, container, callback) {
	var newer = subject;
	var target = container;

	if (newer === void 0 || newer === null) {
		newer = text('');
	} else if (newer.flag === void 0) {
		switch (typeof newer) {
			case 'function': newer = element(newer); break;
			case 'object': newer = fragment(newer); break;
			case 'number': case 'boolean':	case 'string': newer = text(newer); break;
		}
	}

	if (target === void 0 || target === null) {
		// use <body> if it exists at this point
		// else default to the root <html> node
		if (body === null) {
			body = documentElement();
		}

		// server enviroment
		if (server === true && body === null) {
			return exports.renderToString(newer);
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
		var parent = new Tree(2);

		target.this = newer;
		parent.node = target;

		switch (callback) {
			case 'replace': {
				shared.node = target;
				parent.node = parentNode(shared);
				create(newer, parent, shared, 3, newer, null);
				shared.node = null;
				break;
			}
			case 'destroy': {
				removeChildren(parent);
			}
			default: {
				create(newer, parent, shared, 1, newer, null);
			}
		}
	}

	if (callback !== void 0 && callback.constructor === Function) {
		callback();
	}
}
