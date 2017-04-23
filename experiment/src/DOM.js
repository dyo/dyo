/**
 * Create Node
 *
 * @param  {Tree} newer
 * @param  {Tree?} _ancestor
 * @param  {Number} action
 * @param  {String?} _xmlns
 * @param  {Node} parent
 * @param  {Node} sibling
 */
 function create (older, _ancestor, action, _xmlns, parent, sibling) {
 	var xmlns = _xmlns;
 	var ancestor = _ancestor;
 	var group = older.group;
 	var flag = older.flag;
 	var type = 0;
 	var owner;
 	var node;
 	var children;
 	var length;
 	var newer;

 	// preserve last namespace among children
 	if (flag !== 1 && older.xmlns !== null) {
 		xmlns = older.xmlns;
 	}

 	if (group > 0) {
 		// every instance registers the last root component, children will use
 		// this when attaching events, to support boundless events
 		if (group > 1) {
 			ancestor = older;
 		}

 		newer = extract(older);
 		flag = newer.flag;
 		owner = older.owner;

 		if (owner.componentWillMount !== void 0) {
 			mountBoundary(owner, 0);
 		}
 		if (newer.group === 0) {
 			type = 2;
 		} else {
 			create(newer, ancestor, action, xmlns, parent, sibling);
 		}
 	} else {
 		type = 2;
 	}

 	if (type === 2) {
 		if (flag === 1) {
 			node = older.node = document.createTextNode((type = 1, older.children));
 		} else {
 			node = nodeBoundary(flag, older, ancestor, xmlns);

 			if (older.flag === 3) {
 				create(node, ancestor, action, xmlns, parent, sibling);
 				clone(older, node, (type = 0, false));
 			} else {
 				older.node = node;
 				children = older.children;
 				length = children.length;

 				if (length > 0) {
 					for (var i = 0, child; i < length; i++) {
 						// hoisted
 						if ((child = children[i]).node !== null) {
 							clone(child = children[i] = new Tree(child.flag), child, false);
 						}
 						create(child, ancestor, 1, xmlns, node, null);
 					}
 				}
 			}
 		}
 	}

 	if (type !== 0) {
 		switch (action) {
 			case 1: parent.appendChild(node); break;
 			case 2: parent.insertBefore(node, sibling); break;
 			case 3: parent.replaceChild(node, sibling); break;
 		}
 		if (type !== 1) {
 			attribute(older, ancestor, xmlns);
 		}
 	}

 	if (group > 0 && owner.componentDidMount !== void 0) {
 		mountBoundary(owner, 1);
 	}
 }

/**
 * Change Node
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Node} parent
 * @param {Tree} ancestor
 */
function change (older, newer, parent, ancestor) {
	create(newer, ancestor, 3, null, parent, older.node);
}

/**
 * Swap Node
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Tree} ancestor
 */
function swap (older, newer, ancestor) {
	create(newer, ancestor, 3, null, older.node.parentNode, older.node);
}

/**
 * Move Node
 *
 * @param {Node} node
 * @param {Node} sibling
 * @param {Node} parent
 */
function move (node, sibling, parent) {
	parent.insertBefore(node, sibling);
}

/**
 * Append Node
 *
 * @param {Node} node
 * @param {Node} parent
 */
function append (node, parent) {
	parent.appendChild(node);
}

/**
 * Remove Node
 *
 * @param {Node} node
 * @param {Node} parent
 */
function remove (node, parent) {
	parent.removeChild(node);
}

/**
 * Replace Node
 *
 * @param {Node} node
 * @param {Node} sibling
 * @param {Node} parent
 */
function replace (node, sibling, parent) {
	parent.replaceChild(node, sibling);
}

/**
 * Clear Node
 *
 * @param {Node} node
 */
function clear (node) {
	node.textContent = null;
}

/**
 * Update Text Content
 *
 * @param {Node} older
 * @param {String|Number} value
 */
function content (node, value) {
	node.nodeValue = value;
}

/**
 * Assign Attributes
 *
 * @param {Number} type
 * @param {String} name
 * @param {Any} value
 * @param {String?} xmlns
 * @param {Tree} newer
 */
function assign (type, name, value, xmlns, newer) {
	var node = newer.node;
	switch (type) {
		case 0: {
			if (value !== null && value !== void 0 && value !== false) {
				node.setAttribute(name, (value === true ? '' : value));
			} else {
				node.removeAttribute(name);
			}
			break;
		}
		case 1: {
			if (xmlns === null) {
				node.className = value;
			} else {
				assign(0, 'class', value, xmlns, node);
			}
			break;
		}
		case 3: {
			if (node[name] === void 0) {
				node.style.setProperty(name, value);
			} else if (isNaN(Number(value)) === true) {
				assign(0, name, value, xmlns, node);
			} else {
				assign(2, name, value, xmlns, node);
			}
			break;
		}
		case 4: {
			node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value);
			break;
		}
		case 5:
		case 6: {
			node[name] = value;
			break;
		}
		case 10: {
			node.innerHTML = value;
			break;
		}
	}
}

/**
 * Assign Unknown Attribute
 *
 * @param {String} name
 * @param {Any} value
 * @param {Node} node
 */
function set (name, value, node) {
	try {
		node[name] = value;
	} catch (err) {}
}

/**
 * Assign Styles
 *
 * @param {Tree} newer
 */
function style (newer) {
	var node = newer.node.style;
	var next = newer.attrs.style;

	if (typeof next === 'string') {
		node.cssText = next;
	} else {
		for (var name in next) {
			if (name in node) {
				node[name] = next[name];
			}
		}
	}
}

/**
 * Update Styles
 *
 * @param {Tree} older
 * @param {Tree} newer
 */
function styles (older, newer) {
	var node = older.node.style;
	var next = newer.attrs.style;
	var prev = older.attrs.style;
	var value;

	if (typeof next === 'string') {
		if (next !== prev) {
			node.cssText = next;
		}
	} else {
		for (var name in next) {
			if ((value = next[name]) !== prev[name]) {
				node[name] = value;
			}
		}
	}
}

/**
 * Create Events
 *
 * @param {Tree} older
 * @param {String} name
 * @param {Function} handler
 * @param {Tree} ancestor
 */
function event (older, name, handler, ancestor) {
	older.node[name.toLowerCase()] = typeof handler !== 'function' ? null : (
		ancestor !== null && ancestor.group > 1 ? function proxy (e) {
			eventBoundary(ancestor.owner, handler, e);
		} : handler
	);
}
