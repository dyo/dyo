/**
 * Render Tree
 *
 * @param  {Tree} _newer
 * @param  {Node} _target
 */
function render (_newer, _target) {
	var newer = _newer;
	var target = _target;

	if (target === void 0 || target === document) {
		if (mount === null) {
			mount = document.body || document.documentElement;
		}

		target = mount;
	}

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

	var older = target._older;

	if (older !== void 0) {
		if (older.type === newer.type) {
			patch(older, newer, older.cast);
		} else {
			swap(older, newer, true);
		}
	} else {
		append(newer, target, create(newer, null, null));
		target._older = newer;
	}
}

/**
 * Shallow Render
 *
 * @param  {Any} tree
 * @return {Tree}
 */
function shallow (tree) {
	return shape(tree, null, true);
}
