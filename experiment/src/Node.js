/**
 * Extract Component Tree
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
	var owner;
	var result;
	var proto;
	var UUID;

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
		UUID = (proto = type.prototype).UUID;
		if (UUID === 2) {
			owner = new type(props);
		} else {
			if (UUID !== 1) {
				extendClass(type, proto);
			}
			owner = new type(props);
			Component.call(owner, props);
		}
		tree.async = 1;
		result = renderBoundary(owner, group);
		tree.async = 0;

		result = shape(result, tree);
		owner._tree = tree;
		tree.owner = owner;
	} else {
		result = shape(renderBoundary(tree, group), tree);
	}
	return result;
}

/**
 * Shape Tree
 *
 * @param  {Any} _newer
 * @param  {Tree?} older
 * @return {Tree}
 */
function shape (_newer, older) {
	var newer = (_newer !== null && _newer !== void 0) ? _newer : text('');

	if (newer.group === void 0) {
		switch (typeof newer) {
			case 'function': {
				newer = element(newer, older === null ? null : older.props);
				break;
			}
			case 'string':
			case 'number':
			case 'boolean': {
				newer = text(newer);
				break;
			}
			case 'object': {
				switch (newer.constructor) {
					case Promise: return resolve(newer, older);
					case Array: newer = fragment(newer); break;
					case Date: newer = text(newer+''); break;
					case Object: newer = text(''); break;
					default: tree = text('');
				} break;
			}
		}
	}
	return newer;
}

/**
 * Resolve Tree
 *
 * @param {Promise} pending
 * @param {Tree} older
 */
function resolve (pending, older) {
	older.async = 2;

	pending.then(function (value) {
		var newer = value;
		if (older.node === null) {
			return;
		}
		older.async = 0;
		newer = shape(newer, older);
		if (older.tag !== newer.tag) {
			exchange(older, newer, 0, older);
		} else {
			patch(older, newer, 0, older);
		}
	});

	return older.node !== null ? older : text('');;
}

/**
 * Exchange Tree
 *
 * @param {Tree} newer
 * @param {Tree} older
 * @param {Number} type
 * @param {Tree} ancestor
 */
function exchange (older, newer, type, ancestor) {
	swap(older, newer, ancestor);

	switch (type) {
		case 0: {
			if (older.flag !== 1 && older.children.length > 0) {
				empty(older);
			}
			clone(older, newer, type);
			break;
		}
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
	var owner = older.owner;
	var host = older.host;

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

	if (older.flag === 1 || length === 0) {
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
 * Fill Children
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Tree} ancestor
 */
function fill (older, newer, ancestor) {
	var owner = ancestor.owner;
	var parent = older.node;
	var children = newer.children;
	var length = children.length;

	for (var i = 0, child; i < length; i++) {
		create(child = children[i], null, owner, parent, null, 1);
	}
	older.children = children;
}
