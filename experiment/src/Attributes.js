/**
 * Create Attributes
 *
 * @param {Tree} newer
 * @param {Component?} owner
 * @param {String?} xmlns
 * @param {Node} node
 * @param {Boolean} hydrate
 */
function attribute (newer, owner, xmlns, node, hydrate) {
	var attrs = newer.attrs;
	var value;

	for (var name in attrs) {
		if (name !== 'key' && name !== 'children') {
			value = attrs[name];

			if (name !== 'ref') {
				if (evt(name) === true) {
					event(node, name, owner, value);
				} else if (hydrate === false) {
					assign(attr(name), name, value, xmlns, node, newer);
				}
			} else {
				refs(value, owner, node, 0);
			}
		}
	}
}

/**
 * Reconcile Attributes
 *
 * @param {Tree} newer
 * @param {Tree} older
 * @param {Tree} ancestor
 */
function attributes (older, newer, ancestor) {
	var oldAttrs = older.attrs;
	var newAttrs = newer.attrs;
	var xmlns = older.xmlns;
	var node = older.node;
	var owner = ancestor.owner;

	var oldValue;
	var newValue;

	for (var name in newAttrs) {
		if (name !== 'key' && name !== 'children') {
			newValue = newAttrs[name];

			if (name !== 'ref') {
				oldValue = oldAttrs[name];

				if (newValue !== oldValue && newValue !== null && newValue !== void 0) {
					if (evt(name) === false) {
						assign(attr(name), name, newValue, xmlns, node, ancestor);
					} else {
						event(node, name, owner, newValue);
					}
				}
			} else {
				refs(newValue, ancestor.owner, node, 2);
			}
		}
	}

	for (var name in oldAttrs) {
		if (name !== 'key' && name !== 'children' && name !== 'ref') {
			newValue = newAttrs[name];

			if (newValue === null || newValue === void 0) {
				if (evt(name) === false) {
					assign(attr(name), name, newValue, xmlns, node, ancestor);
				} else {
					event(node, name, owner, newValue);
				}
			}
		}
	}

	older.attrs = newAttrs;
}

/**
 * Create Refs
 *
 * @param  {Function|String} value
 * @param  {Component} owner
 * @param  {Node} node
 * @param  {Number} type
 */
function refs (value, owner, node, type) {
	if (owner !== null && owner.refs === null) {
		owner.refs = {};
	}

	switch (typeof value) {
		case 'function': {
			callbackBoundary(owner, value, node, type);
			break;
		}
		case 'string': {
			if (type === 0 && owner !== null) {
				owner.refs[value] = node;
			}
			break;
		}
	}
}

/**
 * Assign Attributes
 *
 * @param {Number} type
 * @param {String} name
 * @param {Any} value
 * @param {String?} xmlns
 * @param {Node} node
 */
function assign (type, name, value, xmlns, node) {
	switch (type) {
		case 1: {
			if (xmlns === null) {
				node.className = value;
			} else {
				assign(6, 'class', value, xmlns, node);
			}
			break;
		}
		case 2: {
			node.id = value;
			break;
		}
		case 3: {
			if (typeof value === 'string') {
				node.style.cssText = value;
			} else {
				style(value, node.style);
			}
			break;
		}
		case 4: {
			node.innerHTML = value;
			break;
		}
		case 5: {
			if (node[name] === void 0) {
				node.style.setProperty(name, value);
			} else if (isNaN(Number(value)) === true) {
				assign(6, name, value, xmlns, node);
			} else {
				set(node, name, value);
			}
			break;
		}
		case 6: {
			if (name === 'xlink:href') {
				node.setAttributeNS('http://www.w3.org/1999/xlink', 'href', value);
			} else if (value !== null && value !== void 0 && value !== false) {
				node.setAttribute(name, (value === true ? '' : value));
			} else {
				node.removeAttribute(name);
			}
			break;
		}
	}
}

/**
 * Attribute Identifier [Whitelist]
 *
 * @param  {String} name
 * @param  {Tree} tree
 * @return {Number}
 */
function attr (name, tree) {
	switch (name) {
		case 'class': case 'className': return 1;
		case 'id': return 2;
		case 'style': return 3;
		case 'innerHTML': return 4;
		case 'width': case 'height': return 5;
		default: return 6;
	}
}

/**
 * Event Attribute Validator [Whitelist]
 *
 * @param  {String} name
 * @return {Boolean}
 */
function evt (name) {
	return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110;
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
 * Merge Props
 *
 * @param {Object} source
 * @param {Object} props
 */
function merge (source, props) {
	for (var name in source) {
		if (props[name] === void 0) {
			props[name] = source[name];
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
