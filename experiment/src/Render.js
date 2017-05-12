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
		switch (newer.constructor) {
			case Function: newer = element(newer); break;
			case Array: newer = fragment(newer); break;
			case Boolean: newer = text(''); break;
			case Object: newer = stringify(value); break;
			case Date: newer = text(value.toString()); break;
			case Number: case String: newer = text(newer); break;
		}
	}

	if (target === void 0 || target === null) {
		// uses <body> if it exists at this point
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

		target.this = older = newer;
		parent.node = target;

		if (callback === void 0 || callback === null || callback.constructor === Function) {
			create(newer, parent, shared, 1, newer, null);
		} else {
			hydrate(newer, parent, 0, callback, newer, null);
		}
	}

	if (callback !== void 0 && callback !== null && callback.constructor === Function) {
		callbackBoundary(older, older.owner, callback, target, 0);
	}
}
