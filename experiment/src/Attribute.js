/**
 * Attributes [Whitelist]
 *
 * @param  {String} name
 * @return {Number}
 */
function attr (name) {
	switch (name) {
		case 'class':
		case 'className': return 1;

		case 'width':
		case 'height': return 3;

		case 'xlink:href': return 4;

		case 'defaultValue': return 5;

		case 'id':
		case 'selected':
		case 'hidden':
		case 'checked':
		case 'value': return 6;

		case 'innerHTML': return 10;

		case 'style': return 20;

		case 'ref': return 30;
		case 'key': case 'children': return 31;

		default: return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 ? 21 : 0;
	}
}

/**
 * Attribute [Mount]
 *
 * @param {Tree} newer
 * @param {String?} xmlns
 * @param {Node} node
 */
function attribute (newer, xmlns, node) {
	var attrs = newer.attrs;
	var type;
	var value;

	for (var name in attrs) {
		type = attr(name);

		if (type < 31) {
			value = attrs[name];

			if (type === 30) {
				refs(newer, value, 2);
			} else if (type < 20) {
				if (value !== void 0 && value !== null) {
					setAttribute(type, name, value, xmlns, node);
				}
			} else if (type > 20) {
				eventListener(newer, name, value, 1, node);
			} else {
				setStyle(newer, newer, 0);
			}
		}
	}
}

/**
 * Attributes [Reconcile]
 *
 * @param {Tree} newer
 * @param {Tree} older
 */
function attributes (older, newer) {
	var node = older.node;
	var prevs = older.attrs;
	var attrs = newer.attrs;

	if (prevs === attrs && attr === object) {
		return;
	}

	var xmlns = older.xmlns;
	var type;
	var prev;
	var next;

	// old attributes
	for (var name in prevs) {
		type = attr(name);

		if (type < 30) {
			next = attrs[name];

			if (next === null || next === void 0) {
				if (type < 20) {
					setAttribute(type, name, next, xmlns, node);
				} else if (type > 20) {
					eventListener(older, name, next, 0);
				}
			}
		}
	}

	// new attributes
	for (var name in attrs) {
		type = attr(name);

		if (type < 31) {
			next = attrs[name];

			if (type === 30) {
				refs(older, next, 2);
			} else {
				prev = prevs[name];

				if (next !== prev && next !== null && next !== void 0) {
					if (type < 20) {
						setAttribute(type, name, next, xmlns, node);
					} else if (type > 20) {
						eventListener(older, name, next, 2);
					} else {
						setStyle(older, newer, 1);
					}
				}
			}
		}
	}

	older.attrs = attrs;
}

/**
 * Refs
 *
 * @param  {Tree} older
 * @param  {Function|String} value
 * @param  {Number} type
 */
function refs (older, value, type) {
	var host = older.host;
	var stateful = false;
	var owner;

	if (host !== null) {
		if ((owner = host.owner) !== null && host.group > 1) {
			stateful = true;
		}
	}

	if (stateful === true && owner.refs === null) {
		owner.refs = {};
	}

	if (value === void 0 || value === null) {
		return;
	}

	switch (value.constructor) {
		case Function: {
			callbackBoundary(older, owner, value, older.node, type);
			break;
		}
		case String: {
			if (stateful === true) {
				owner.refs[value] = older.node;
			}
			break;
		}
	}
}

/**
 * Merge
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
