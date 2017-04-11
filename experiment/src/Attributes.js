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

	for (var name in attrs) {
		if (name === 'ref') {
			refs(attrs[name], owner, node, 0);
		} else if (name !== 'key' && name !== 'children') {
			if (evt(name) === true) {
				event(name.toLowerCase().substring(2), attrs[name], owner, node);
			} else if (hydrate === false) {
				assign(attr(name), name, attrs[name], xmlns, node);
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

	var oldValue;
	var newValue;

	for (var name in newAttrs) {
		// name !== 'key' && name !== 'children' && name !== 'ref'
		if (name !== 'key' && name !== 'children' && evt(name) === false) {
			newValue = newAttrs[name];

			if (name === 'ref') {
				refs(newValue, ancestor.owner, node, 1);
			} else {
				oldValue = oldAttrs[name];

				if (newValue !== oldValue && newValue !== null && newValue !== void 0) {
					assign(attr(name), name, newValue, xmlns, node);
				}
			}
		}
	}

	for (var name in oldAttrs) {
		if (name !== 'key' && name !== 'children' && name !== 'ref' && evt(name) === false) {
			newValue = newAttrs[name];

			if (newValue === null || newValue === void 0) {
				assign(attr(name), name, newValue, xmlns, node);
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
			if (type === 0) {
				schedule(function () {
					callbackBoundary(owner, value, node, 2);
				});
			} else {
				callbackBoundary(owner, value, node, 0);
			}
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
				node[name] = value;
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
