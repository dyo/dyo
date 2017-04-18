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
	var newAttrs = newer.attrs;
	var value;

	for (var name in newAttrs) {
		if (name !== 'key' && name !== 'children') {
			value = newAttrs[name];

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
 * Attribute Identifier [Whitelist]
 *
 * @param  {String} name
 * @return {Number}
 */
function attr (name) {
	switch (name) {
		case 'class':
		case 'className': return 1;
		case 'style': return 2;
		case 'width':
		case 'height': return 3;
		case 'id':
		case 'selected':
		case 'hidden':
		case 'value':
		case 'innerHTML': return 5;
		case 'xlink:href': return 6;
		default: return 0;
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
