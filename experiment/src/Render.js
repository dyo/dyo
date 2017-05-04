/**
 * Render
 *
 * @param {Any} subject
 * @param {Node?} container
 * @param {Object?} options
 */
function render (subject, container, options) {
	var newer = subject;
	var target = container;

	if (newer === void 0 || newer === null) {
		newer = text('');
	} else if (newer.flag === void 0) {
		switch (typeof newer) {
			case 'function': {
				newer = element(newer);
				break;
			}
			case 'object': {
				newer = fragment(newer);
				break;
			}
			case 'number':
			case 'boolean':
			case 'string': {
				newer = text(newer);
				break;
			}
		}
	}

	if (target === void 0 || target === null) {
		// use <body> if it exists at this point
		// else default to the root <html> node
		if (body === null) {
			body = global.document !== void 0 ? (document.body || document.documentElement) : null;
		}

		target = body;

		// server enviroment
		if (server === true && target === null) {
			return exports.renderToString(newer);
		}
	}

	var older = target.this;

	if (older !== void 0) {
		if (older.key === newer.key && older.type === newer.type) {
			patch(older, newer, older.group);
		} else {
			exchange(older, newer, true);
		}
	} else {
		var parent = new Tree(2);

		target.this = newer;

		switch ((options !== void 0 ? options.type : options)) {
			case 'replace': {
				parent.node = (shared.node = target).parentNode;
				create(newer, parent, shared, 3, newer, null);
				shared.node = null;
				break;
			}
			case 'remove': {
				target.textContent = null;
			}
			default: {
				parent.node = target;
				create(newer, parent, shared, 1, newer, null);
			}
		}
	}

	if (options !== void 0 && options.constructor === Function) {
		options();
	}
}
