/**
 * Shape Tree
 *
 * @param  {Tree} _tree
 * @param  {Component?} owner
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
		if ((proto = type.prototype).UUID === 7) {
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
		result = shape(renderBoundary(tree, group), tree);
	}
	return result;
}

/**
 * Exchange Node
 *
 * @param {Tree} newer
 * @param {Tree} older
 * @param {Number} type
 * @param {Tree} ancestor
 */
function exchange (older, newer, type, ancestor) {
	swap(older, newer, ancestor);

	switch (type) {
		case 1: {
			unmount(older);
			break;
		}
		case 2: {
			if (older.host !== null) {
				unmount(older.host);
			}
			break;
		}
		default: {
			if (older.flag !== 1 && older.children.length > 0) {
				empty(older);
			}
			clone(older, newer, type);
		}
	}
	clone(older, newer, type);
}

/**
 * Refresh Tree
 *
 * @param {Tree} older
 */
function refresh (older) {
	var parent = older.parent;

	if (parent !== null) {
		parent.node = older.node;
		refresh(parent);
	}
}

/**
 * Unmount
 *
 * @param {Tree} older
 */
function unmount (older) {
	var host = older.host;
	var owner = older.owner;

	if (owner !== null && owner.componentWillUnmount !== void 0) {
		mountBoundary(owner, 2);
	}

	if (host !== null) {
		unmount(host);
	}
}

/**
 * Empty Children
 *
 * @param  {Tree} older
 */
function empty (older) {
	var children = older.children;
	var length = children.length;

	if (clear === false && (older.flag === 1 || length === 0)) {
		return;
	}

	for (var i = 0, child; i < length; i++) {
		child = children[i];

		if (child.group > 0 && child.owner.componentWillUnmount !== void 0) {
			mountBoundary(child.owner, 2);
		}
		empty(child);
	}
	older.parent = null;
	older.host = null;
	older.owner = null;
	older.node = null;
}

/**
 * fill Children
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Tree} ancestor
 */
function fill (older, newer, ancestor) {
	var parent = older.node;
	var children = newer.children;
	var length = children.length;
	var owner = ancestor.owner;

	for (var i = 0, child; i < length; i++) {
		create(child = children[i], null, owner, parent, null, 1);
	}
	older.children = children;
}
