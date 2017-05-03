/**
 * Render
 *
 * @param  {Tree} subject
 * @param  {Node} _target
 */
function render (subject, target) {
	var newer = subject;
	var mount = target;
	var older;
	var sibling;
	var parent;

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

	if (mount === void 0 || mount === null) {
		// use <body> if it exists at this point
		// else default to the root <html> node
		if (body === null) {
			if (global.document !== void 0) {
				body = document.body || document.documentElement;
			} else {
				body = null;
			}
		}

		mount = body;

		// server enviroment
		if (mount === null && newer.toString !== void 0) {
			return newer.toString();
		}
	}

	if ((older = mount.this) !== void 0) {
		if (older.key === newer.key && older.type === newer.type) {
			patch(older, newer, older.group);
		} else {
			exchange(older, newer, true);
		}
	} else {
		mount.this = newer;
		parent = new Tree(2);

		if (mount.getAttribute('slot') !== null) {
			parent.node = (shared.node = mount).parentNode;

			create(newer, parent, shared, 3, newer, null);

			shared.node = null;
		} else {
			parent.node = mount;

			create(newer, parent, shared, 1, newer, null);
		}
	}
}
