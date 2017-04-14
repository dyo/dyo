/**
 * Shape Tree
 *
 * @param  {Tree} _tree
 * @param  {Component} owner
 * @return {Tree}
 */
function shape (_tree, owner) {
	var tree = (_tree !== null && _tree !== void 0) ? _tree : text('');

	if (tree.group === void 0) {
		switch (typeof tree) {
			case 'function': {
				tree = element(tree, owner === null ? null : owner.props);
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
					case Promise: return resolve(tree, owner);
					case Array: tree = fragment(tree); break;
					case Date: tree = text(tree+''); break;
					case Object: tree = text(''); break;
					default: tree = text('');
				} break;
			}
		}
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
	var group = tree.group;
	var result;
	var owner;
	var proto;

	if (props === object) {
		props = {};
	}
	if (type.defaultProps !== void 0) {
		props = merge(type.defaultProps, props);
	}
	if (length !== 0) {
		if (props === object) {
			props = {children: children};
		} else {
			props.children = children;
		}
	}

	if (group === 1) {
		proto = type.prototype;

		if (proto.UUID === 7) {
			owner = new type(props);
		} else {
			if (proto.setState === void 0) {
				extendClass(type, proto);
			}
			owner = new type(props);
			Component.call(owner, props);
		}

		result = renderBoundary(owner, group);

		owner._sync = 0;

		result = shape(result, owner);

		owner._tree = tree;
		tree.owner = owner;
	} else {
		tree.group = group;
		tree.owner = type;

		result = shape(renderBoundary(tree, group), tree);
	}

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

	owner._sync = 2;

	pending.then(function (value) {
		var older;
		var newer;

		owner._sync = 0;

		if ((older = owner._tree) === null) {
			return;
		}
		// node removed
		if (older.node === null) {
			return;
		}

		newer = shape(value, owner);

		if (older.tag !== newer.tag) {
			swap(older, newer, 0, older);
		} else {
			patch(older, newer, 0, older);
		}
	});

	return tree;
}
