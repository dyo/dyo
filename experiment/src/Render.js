/**
 * Render
 *
 * @param  {Tree} _newer
 * @param  {Node} _target
 */
function render (_newer, _target) {
	var newer = _newer;
	var target = _target;
	var older;
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

	if (target === void 0 || target === null) {
		// use <body> if it exists at this point
		// else default to the root <html> node
		if (mount === null) {
			if (global.document !== void 0) {
				mount = document.body || document.documentElement;
			} else {
				mount = null;
			}
		}

		target = mount;

		// server enviroment
		if (target === null && newer.toString !== void 0) {
			return newer.toString();
		}
	}

	if ((older = target._older) !== void 0) {
		if (older.key === newer.key && older.type === newer.type) {
			patch(older, newer, older.group);
		} else {
			exchange(older, newer, true);
		}
	} else {
		parent = new Tree(2);
		parent.node = target;

		create(target._older = newer, parent, empty, 1, newer, null);
	}
}

/**
 * Shallow Render
 *
 * @param  {Any} older
 * @return {Tree}
 */
function shallow (value) {
	var newer = shape(value, null, false);

	while (newer.tag === null) {
		newer = extract(newer);
	}

	return newer;
}
