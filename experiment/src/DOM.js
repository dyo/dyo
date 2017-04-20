/**
 * Document
 *
 * @type {Node?}
 */
var document = browser === true ? global.document : null;

/**
 * Mount
 *
 * @type {Node?}
 */
var mount = browser === true ? document.body : null;

/**
 * Create Element
 *
 * @return {Node}
 */
function createElement (tag) {
	return document.createElement(tag);
}

/**
 * Create Element[Namespaced]
 *
 * @return {Node}
 */
function createElementNS (xmlns, tag) {
	return document.createElementNS(xmlns, tag);
}

/**
 * Create Text Node
 *
 * @return {Node}
 */
function createTextNode (value) {
	return document.createTextNode(value);
}

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
 function create (older, _xmlns, _ancestor, parent, sibling, action) {
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
 			create(newer, xmlns, ancestor, parent, sibling, action);
 			// components may return components recursively,
 			// keep a record of these
 			newer.parent = older;
 			older.host = newer;
 		}
 		copy(older, newer);
 	} else {
 		type = 2;
 	}

 	if (type === 2) {
 		if (flag === 1) {
 			node = createTextNode((type = 1, older.children));
 		} else {
 			node = nodeBoundary(flag, older, xmlns, ancestor);

 			if (older.flag === 3) {
 				create(node, xmlns, ancestor, parent, sibling, action);
 				clone(older, node, type = 0);
 			} else {
 				children = older.children;
 				length = children.length;

 				if (length > 0) {
 					for (var i = 0, child; i < length; i++) {
 						// hoisted
 						if ((child = children[i]).node !== null) {
 							clone(child = children[i] = new Tree(child.flag), child, false);
 						}
 						create(child, xmlns, ancestor, node, null, 1);
 					}
 				}
 			}
 		}
 	}

 	if (type !== 0) {
 		older.node = node;

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
	create(newer, null, ancestor.owner, parent, older.node, 3);
}

/**
 * Swap Node
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Tree} ancestor
 */
function swap (older, newer, ancestor) {
	create(newer, null, ancestor.owner, older.node.parentNode, older.node, 3);
}

/**
 * Move Node
 *
 * @param {Node} node
 * @param {Node} sibling
 * @param {Number} index
 * @param {Node} parent
 */
function move (node, sibling, index, parent) {
	parent.insertBefore(node, sibling !== null ? sibling : parent.childNodes[index]);
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
		case 2: {
			if (typeof value === 'string') {
				node.style.cssText = value;
			} else {
				style(value, node.style);
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
			if (name in node) {
				set(node, name, value);
			} else {
				assign(0, name, value, xmlns, node);
			}
			break;
		}
		case 10: {
			node.innerHTML = value;
			break;
		}
	}
}

/**
 * Set Property
 *
 * @param {Tree} node
 * @param {String} name
 * @param {Any} value
 */
function set (node, name, value) {
	try {
		node[name] = value;
	} catch (err) {
		if (node[name] !== value) {
			node.setProperty(name, value);
		}
	}
}

/**
 * Assign Styles
 *
 * @param {Object} source
 * @param {Object} target
 */
function style (source, target) {
	for (var name in source) {
		if (name in target) {
			target[name] = source[name];
		}
	}
}

/**
 * Create Events
 *
 * @param {Tree} older
 * @param {String} name
 * @param {Tree} ancestor
 * @param {Function} handler
 */
function event (older, name, ancestor, handler) {
	older.node[name.toLowerCase()] = typeof handler !== 'function' ? null : (
		ancestor !== null && ancestor.group > 1 ? function proxy (e) {
			eventBoundary(ancestor.owner, handler, e);
		} : handler
	);
}
