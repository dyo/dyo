/**
 * Whitelist
 *
 * @param  {String} name
 * @return {Number}
 */
function whitelist (name) {
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
 * @param {Boolean} event
 */
function attribute (newer, xmlns, event) {
	var attrs = newer.attrs;
	var node = newer.node;

	for (var name in attrs) {
		var type = event === false ? whitelist(name) : 21;

		if (type < 31) {
			var value = attrs[name];

			if (type === 30) {
				refs(newer, value, 2);
			} else if (type < 20) {
				if (value !== void 0 && value !== null) {
					setAttribute(type, name, value, xmlns, true, node);
				}
			} else if (type > 20) {
				setEvent(newer, name, value, 1);
			} else {
				setStyle(newer, newer, 0);
			}
		}
	}
}

/**
 * Attributes [Reconcile]
 *
 * @param {Tree} older
 * @param {Tree} newer
 */
function attributes (older, newer) {
	var node = older.node;
	var prevs = older.attrs;
	var attrs = newer.attrs;

	if (prevs === attrs && attrs === ATTRS) {
		return;
	}

	var xmlns = older.xmlns;

	// old attributes
	for (var name in prevs) {
		var type = whitelist(name);

		if (type < 31) {
			var next = attrs[name];

			if (next === null || next === void 0) {
				if (type < 20) {
					setAttribute(type, name, next, xmlns, false, node);
				} else if (type > 20) {
					setEvent(older, name, next, 0);
				}
			} else if (type === 30 && next !== (prev = prevs[name])) {
				refs(older, prev, 0);
			}
		}
	}

	// new attributes
	for (var name in attrs) {
		var type = whitelist(name);

		if (type < 31) {
			var next = attrs[name];

			if (type === 30) {
				refs(older, next, 2);
			} else {
				var prev = prevs[name];

				if (next !== prev && next !== null && next !== void 0) {
					if (type < 20) {
						setAttribute(type, name, next, xmlns, true, node);
					} else if (type > 20) {
						setEvent(older, name, next, 2);
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

	if (host !== null) {
		var owner = host.owner;

		if (owner !== null && host.group === CLASS) {
			stateful = true;
		}
	}

	if (stateful === true && owner.refs === null) {
		owner.refs = {};
	}

	if ((older.ref = value) !== void 0 && value !== null) {
		var node = type > 0 ? older.node : null;

		switch (value.constructor) {
			case Function: {
				callbackBoundary(older, owner, value, node, 2);
				break;
			}
			case String: {
				if (stateful === true) {
					owner.refs[value] = node;
				}
				break;
			}
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
