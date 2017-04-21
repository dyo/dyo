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

		case 'xlink:href': return 4;

		case 'defaultValue': return 5;

		case 'id':
		case 'selected':
		case 'hidden':
		case 'value': return 6;

		case 'innerHTML': return 10;

		case 'ref': return 30;
		case 'key': case 'children': return 31;

		default: return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 ? 20 : 0;
	}
}

/**
 * Create Attributes
 *
 * @param {Tree} newer
 * @param {Tree} ancestor
 * @param {String?} xmlns
 */
function attribute (newer, ancestor, xmlns) {
	var newAttrs = newer.attrs;
	var type = 0;
	var value;

	for (var name in newAttrs) {
		type = attr(name);

		if (type < 31) {
			value = newAttrs[name];

			if (type === 30) {
				refs(value, ancestor, newer, 0);
			} else if (type < 20) {
				assign(type, name, value, xmlns, newer);
			} else {
				event(newer, name, ancestor, value);
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
	var type = 0;
	var oldValue;
	var newValue;

	for (var name in newAttrs) {
		type = attr(name);

		if (type < 31) {
			newValue = newAttrs[name];

			if (type === 30) {
				refs(newValue, ancestor, older, 2);
			} else {
				oldValue = oldAttrs[name];

				if (newValue !== oldValue && newValue !== null && newValue !== void 0) {
					if (type < 20) {
						assign(type, name, newValue, xmlns, older);
					} else {
						event(older, name, ancestor, newValue);
					}
				}
			}
		}
	}

	for (var name in oldAttrs) {
		type = attr(name);

		if (type < 30) {
			newValue = newAttrs[name];

			if (newValue === null || newValue === void 0) {
				if (type < 20) {
					assign(type, name, newValue, xmlns, older);
				} else {
					event(older, name, ancestor, newValue);
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
 * @param  {Tree} ancestor
 * @param  {Tree} older
 * @param  {Number} type
 */
function refs (value, ancestor, older, type) {
	var stateful;
	var owner;

	if (ancestor !== null) {
		if ((owner = ancestor.owner) !== null && ancestor.group > 1) {
			stateful = true;
		}
	}
	if (stateful === true && owner.refs === null) {
		owner.refs = {};
	}

	switch (typeof value) {
		case 'function': {
			callbackBoundary(owner, value, older.node, type);
			break;
		}
		case 'string': {
			if (stateful === true && type === 0) {
				owner.refs[value] = older.node;
			}
			break;
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
