/**
 * Render Tree
 *
 * @param  {Tree} _newer
 * @param  {Node} _target
 */
function render (_newer, _target) {
	var newer = _newer;
	var target = _target;
	var older;

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
		// mount points to document.body, if it's null dio was loaded before
		// the body node, try to use <body> if it exists at this point
		// else default to the root <html> node
		if (mount === null) {
			mount = browser === true ? (document.body || document.documentElement) : null;
		}
		target = mount;

		// server enviroment
		if (target === null && newer.toString !== void 0) {
			return newer.toString();
		}
	}

	if ((older = target.older) !== void 0) {
		if (older.key === newer.key) {
			patch(older, newer, older.group, older);
		} else {
			exchange(older, newer, 1, newer);
		}
	} else {
		create(newer, null, newer, target, null, 1);
		target.older = newer;
	}
}

/**
 * Shallow Render
 *
 * @param  {Any} older
 * @return {Tree}
 */
function shallow (older) {
	var newer = shape(older, null);

	while (newer.tag === null) {
		newer = extract(newer);
	}

	return newer;
}
