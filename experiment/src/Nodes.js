/**
 * Create Node
 *
 * @param  {Tree} newer
 * @param  {String?} _xmlns
 * @param  {Component?} _owner
 * @return {Node}
 */
function create (newer, _xmlns, _owner) {
	var cast = newer.cast;
	var xmlns = _xmlns;
	var owner = _owner;
	var flag = newer.flag;

	var node;
	var children;
	var length;

	if (flag === 1) {
		return newer.node = document.createTextNode(newer.children);
	}

	if (newer.xmlns !== null) {
		xmlns = newer.xmlns;
	}

	if (cast > 0) {
		extract(newer);

		owner = newer.owner;
		flag = newer.flag;

		if (owner.componentWillMount !== void 0) {
			mountBoundary(owner, 0);
		}

		if (flag === 1) {
			return newer.node = document.createTextNode(newer.children);
		}
	}

	node = nodeBoundary(flag, newer, xmlns, owner);

	// error creating node
	if (newer.flag === 3) {
		return newer.flag = flag, node = newer.node = create(node, xmlns, owner);
	}

	children = newer.children;
	length = children.length;

	if (length > 0) {
		for (var i = 0, child; i < length; i++) {
			child = children[i];

			if (child.node !== null) {
				child = children[i] = copy(new Tree(child.flag), child, true);
			}

			append(child, node, create(child, xmlns, owner));
		}
	}

	attribute(newer, owner, xmlns, node, false);

	return newer.node = node;
}

/**
 * Append Node
 *
 * @param {Tree} newer
 * @param {Node} parent
 * @param {Function} node
 */
function append (newer, parent, node) {
	parent.appendChild(node);

	if (newer.cast > 0 && newer.owner.componentDidMount !== void 0) {
		mountBoundary(newer.owner, 1);
	}
}

/**
 * Insert Node
 *
 * @param {Tree} newer
 * @param {Node} parent
 * @param {Node} node
 * @param {Node} anchor
 */
function insert (newer, parent, node, sibling) {
	parent.insertBefore(node, sibling);

	if (newer.cast > 0 && newer.owner.componentDidMount !== void 0) {
		mountBoundary(newer.owner, 1);
	}
}

/**
 * Remove Node
 *
 * @param {Tree} older
 * @param {Node} parent
 */
function remove (older, parent) {
	if (older.cast > 0 && older.owner.componentWillUnmount !== void 0) {
		mountBoundary(older.owner, 2);
	}

	parent.removeChild(older.node);

	older.owner = null;
	older.node = null;
}

/**
 * Node Replacer
 *
 * @param {Tree} newer
 * @param {Tree} older
 * @param {Node} parent
 * @param {Node} node
 */
function replace (older, newer, parent, node) {
	if (older.cast > 0 && older.owner.componentWillUnmount !== void 0) {
		mountBoundary(older.owner, 2);
	}

	parent.replaceChild(node, older.node);

	older.owner = null;
	older.node = null;

	if (newer.cast > 0 && newer.owner.componentDidMount !== void 0) {
		mountBoundary(newer.owner, 1);
	}
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
 * Swap Node
 *
 * @param {Tree} newer
 * @param {Tree} older
 * @param {Boolean} deep
 * @param {Tree} ancestor
 */
function swap (older, newer, deep, ancestor) {
	older.node.parentNode.replaceChild(create(newer, null, ancestor.owner), older.node);

	copy(older, newer, deep);
}

/**
 * Empty Children
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 */
function empty (older, newer) {
	var parent = older.node;
	var children = older.children;
	var length = children.length;

	for (var i = 0, child; i < length; i++) {
		child = children[i];

		if (child.cast > 0 && child.owner.componentWillUnmount !== void 0) {
			mountBoundary(child.owner, 2);
		}

		child.owner = null;
		child.node = null;
	}

	older.children = newer.children;
	parent.textContent = null;
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
		append(child = children[i], parent, create(child, null, owner));
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
