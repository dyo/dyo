/**
 * Create Node
 *
 * @param  {Tree} newer
 * @param  {String?} _xmlns
 * @param  {Component?} _owner
 * @param  {Node} parent
 * @param  {Node} sibling
 * @param  {Number} action
 * @return {Node}
 */
function create (newer, _xmlns, _owner, parent, sibling, action) {
	var xmlns = _xmlns;
	var owner = _owner;
	var group = newer.group;
	var flag = newer.flag;
	var type = 0;
	var node;
	var children;
	var length;
	var tree;

	// preserve last namespace among children
	if (flag !== 1 && newer.xmlns !== null) {
		xmlns = newer.xmlns;
	}

	if (group > 0) {
		tree = extract(newer);
		flag = tree.flag;

		// every instance registers the last root component, children will use
		// this when attaching events, to support boundless events
		owner = newer.owner;

		if (owner.componentWillMount !== void 0) {
			mountBoundary(owner, 0);
		}
		if (tree.group === 0) {
			type = 2;
		} else {
			create(tree, xmlns, owner, parent, sibling, action);
			// components may return components recursively,
			// keep a record of these
			tree.parent = newer;
			newer.host = tree;
		}
		copy(newer, tree);
	} else {
		type = 2;
	}

	if (type === 2) {
		if (flag === 1) {
			// .createTextNode is less prone to emit errors
			node = document.createTextNode((type = 1, newer.children));
		} else {
			node = nodeBoundary(flag, newer, xmlns, owner);

			if (newer.flag === 3) {
				create(node, xmlns, owner, parent, sibling, action);
				clone(newer, node, type = 0);
			} else {
				children = newer.children;
				length = children.length;

				if (length > 0) {
					for (var i = 0, child; i < length; i++) {
						// hoisted tree
						if ((child = children[i]).node !== null) {
							clone(child = children[i] = new Tree(child.flag), child, false);
						}
						create(child, xmlns, owner, node, null, 1);
					}
				}
			}
		}
	}

	if (type !== 0) {
		newer.node = node;

		switch (action) {
			case 1: parent.appendChild(node); break;
			case 2: parent.insertBefore(node, sibling); break;
			case 3: parent.replaceChild(node, sibling); break;
		}
		if (type !== 1) {
			attribute(newer, owner, xmlns, node, false);
		}
	}

	if (group > 0 && owner.componentDidMount !== void 0) {
		mountBoundary(owner, 1);
	}
}

/**
 * Remove Node
 *
 * @param {Tree} older
 * @param {Node} parent
 * @param {Node} node
 */
function remove (older, parent, node) {
	if (older.group > 0 && older.owner.componentWillUnmount !== void 0) {
		mountBoundary(older.owner, 2);
	}
	empty(older, older, false);
	parent.removeChild(node);
	release(older);
}

/**
 * Node Replacer
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Node} parent
 * @param {Tree} ancestor
 * @param {Node} node
 */
function replace (older, newer, parent, ancestor, node) {
	if (older.group > 0 && older.owner.componentWillUnmount !== void 0) {
		mountBoundary(older.owner, 2);
	}
	empty(older, older, false);
	create(newer, null, ancestor.owner, parent, node, 3);
	release(older);
}

/**
 * Move Node
 *
 * @param {Node} node
 * @param {Node} next
 * @param {Node} sibling
 */
function move (node, older, sibling) {
	node.insertBefore(older.node, sibling);
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
 * Swap Node
 *
 * @param {Tree} newer
 * @param {Tree} older
 * @param {Number} type
 * @param {Tree} ancestor
 */
function swap (older, newer, type, ancestor) {
	create(newer, null, ancestor.owner, older.node.parentNode, older.node, 3);

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
				empty(older, newer, false);
			}
		}
	}

	clone(older, newer, type);
}

/**
 * Release References
 *
 * @param  {Tree} tree
 */
function release (tree) {
	tree.parent = null;
	tree.host = null;
	tree.owner = null;
	tree.node = null;
}

/**
 * Empty Children
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Boolean} clear
 */
function empty (older, newer, clear) {
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

		empty(child, newer, false);
		release(child);
	}

	if (clear === true) {
		older.children = newer.children;
		older.node.textContent = null;
	}
}

/**
 * Populate Children
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Tree} ancestor
 */
function populate (older, newer, ancestor) {
	var parent = older.node;
	var children = newer.children;
	var length = children.length;
	var owner = ancestor.owner;

	for (var i = 0, child; i < length; i++) {
		create(child = children[i], null, owner, parent, null, 1);
	}
	older.children = children;
}

/**
 * Update Text Content
 *
 * @param {Tree} older
 * @param {Tree} newer
 */
function content (older, newer) {
	if (older.children !== newer.children) {
		older.node.nodeValue = older.children = newer.children;
	}
}
