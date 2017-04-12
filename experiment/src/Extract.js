/**
 * Shape Tree
 *
 * @param  {Tree} _tree
 * @param  {Component} owner
 * @param  {Boolean} deep
 * @return {Tree}
 */
function shape (_tree, owner, deep) {
	var tree = (_tree !== null && _tree !== void 0) ? _tree : text('');
	var cast = tree.cast;

	if (cast === void 0) {
		switch (typeof tree) {
			case 'function': {
				tree = fragment(element(tree, owner === null ? null : owner.props));
				break;
			}
			case 'string':
			case 'number':
			case 'boolean': {
				tree = text(tree);
				break;
			}
			case 'object': {
				switch (tree.constructor) {
					case Promise: {
						return resolve(tree, owner);
					}
					case Array: {
						tree = fragment(tree);
						break;
					}
					case Date: {
						tree = text(tree+'');
						break;
					}
					case Object: {
						tree = tree.length > 0 && tree[0] !== void 0 ? fragment(tree) : text('');
						break;
					}
					default: tree = text('');
				}
				break;
			}
		}
		cast = tree.cast;
	} else if (cast > 0) {
		tree = fragment(tree);
	}

	if (cast > 0 && deep === true && tree.tag === null) {
		return extract(tree);
	}

	return tree;
}

/**
 * Extract Component
 *
 * @param  {Tree} tree
 * @return {Tree}
 */
function extract (tree) {
	var type = tree.type;
	var props = tree.props;
	var children = tree.children;
	var length = children.length;
	var cast = tree.cast;

	var result;
	var owner;
	var proto;

	if (props === null) {
		props = {};
	}

	if (type.defaultProps !== void 0) {
		props = merge(type.defaultProps, props);
	}

	if (length !== 0) {
		if (props === null) {
			props = {children: children};
		} else {
			props.children = children;
		}
	}

	if (cast === 1) {
		proto = type.prototype;

		if (proto._ === 7) {
			owner = new type(props);
		} else {
			if (proto.setState === void 0) {
				extendClass(type, proto);
			}

			owner = new type(props);
			Component.call(owner, props);
		}

		result = renderBoundary(owner, cast);

		owner._block = 0;

		result = shape(result, owner, false);

		owner._tree = tree;
		tree.owner = owner;
	} else {
		tree.cast = cast;
		tree.owner = type;

		result = shape(renderBoundary(tree, cast), null, false);
	}

	tree.flag = result.flag;
	tree.tag = result.tag;
	tree.attrs = result.attrs;
	tree.children = result.children;
	tree.keyed = result.keyed;
	tree.xmlns = result.xmlns;

	return result;
}

/**
 * Resolve
 *
 * @param {Promise} pending
 * @param {Component} owner
 */
function resolve (pending, owner) {
	var tree;

	if (owner === null) {
		return;
	}

	tree = owner._tree;

	if (tree === null) {
		tree = text('');
	}

	owner._block = 2;

	pending.then(function (value) {
		var older;
		var newer;

		owner._block = 0;

		if ((older = owner._tree) === null) {
			return;
		}

		// node removed
		if (older.node === null) {
			return;
		}

		newer = shape(value, owner, false);

		if (older.tag !== newer.tag) {
			swap(older, newer, false, older);
		} else {
			patch(older, newer, 0, older);
		}
	});

	return tree;
}
