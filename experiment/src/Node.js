/**
 * Create
 *
 * @param  {Tree} newer
 * @param  {Tree} parent
 * @param  {Tree} sibling
 * @param  {Number} action
 * @param  {Tree?} _host
 * @param  {String?} _xmlns
 */
function create (newer, parent, sibling, action, _host, _xmlns) {
	var host = _host;
	var xmlns = _xmlns;
	var group = newer.group;
	var flag = newer.flag;
	var type = 2;
	var node = null;
	var skip;
	var owner;
	var temp;
	var tag;

	// resolve namespace
 	if (flag !== 1 && newer.xmlns !== null) {
 		xmlns = newer.xmlns;
 	}

 	// cache host
 	if (host !== shared) {
		newer.host = host;
 	}

 	if (group > 0) {
 		if (group > 1) {
 			host = newer;
 		}

 		temp = extract(newer, true);
 		flag = temp.flag;
 		owner = newer.owner;
 	}

 	switch (flag) {
 		case 1: {
 			node = newer.node = createTextNode(newer.children);
 			type = 1;
 			break;
 		}
 		case 3: {
 			create(temp = temp.children[0], parent, sibling, action, newer, _xmlns);
 			newer.node = temp.node;
 			break;
 		}
 		default: {
 			if (flag === 2) {
	 			// auto namespace svg & math roots
	 			switch ((tag = newer.tag)) {
	 				case 'svg': xmlns = svg; break;
	 				case 'math': xmlns = math; break;
	 			}

	 			node = createElement(tag, newer, host, xmlns);

	 			if (newer.flag === 5) {
	 				create(node, newer, sibling, action, host, xmlns);
	 				copy(newer, node, false);
	 				return;
	 			}

	 			newer.node = node;
 			} else {
 				// portal
 				newer.node = newer.type;
 			}

 			var children = newer.children;
 			var length = children.length;

 			if (length > 0) {
 				for (var i = 0, child; i < length; i++) {
 					// hoisted
 					if ((child = children[i]).node !== null) {
 						copy(child = children[i] = new Tree(child.flag), child, false);
 					}

 					create(child, newer, sibling, 1, host, xmlns);
 				}
 			}
 		}
 	}

	if (group > 0 && owner.componentWillMount !== void 0) {
		mountBoundary(newer, owner, node, 0);
	}

	newer.parent = parent;

	if (node !== null) {
		switch (action) {
			case 1: appendChild(newer, parent); break;
			case 2: insertBefore(newer, sibling, parent); break;
			case 3: skip = remove(sibling, newer, parent); break;
		}

		if (type !== 1) {
			attribute(newer, xmlns, node);
		}
	}

	if (group > 0 && skip !== true && owner.componentDidMount !== void 0) {
		mountBoundary(newer, owner, node, 1);
	}
}

/**
 * Extract
 *
 * @param  {Tree} older
 * @param  {Boolean} abstract
 * @return {Tree}
 */
function extract (older, abstract) {
	var type = older.type;
	var props = older.props;
	var children = older.children;
	var group = older.group;
	var length = children.length;
	var defaults = type.defaultProps;
	var types = type.propTypes;
	var owner;
	var newer;
	var proto;
	var UUID;

	if (props === object) {
		props = {};
	}

	if (length !== 0) {
		props.children = children;
	}

	if (defaults !== void 0) {
		merge(getInitialStatic(type, defaults, 'defaultProps', props), props);
	}

	if (types !== void 0) {
		getInitialStatic(type, types, 'propTypes', props);
	}

	if (group > 1) {
		UUID = (proto = type.prototype).UUID;

		if (UUID === 2) {
			owner = new type(props);
		} else {
			if (UUID !== 1) {
				extendClass(type, proto);
			}

			owner = new type(props);
			Component.call(owner, props);
		}

		older.owner = owner;

		older.async = 1;
		newer = renderBoundary(older, group);
		older.async = 0;

		if (owner.getInitialState !== void 0) {
			getInitialState(older, dataBoundary(shared, owner, 1, owner.props));
		}

		newer = shape(newer, owner.this = older, abstract);
	} else {
		newer = (older.owner = type, shape(renderBoundary(older, group), older, abstract));
	}

	older.tag = newer.tag;
	older.flag = newer.flag;
	older.node = newer.node;
	older.attrs = newer.attrs;
	older.xmlns = newer.xmlns;
	older.children = newer.children;

	return newer;
}

/**
 * Shape
 *
 * @param  {Any} value
 * @param  {Tree?} older
 * @param  {Boolean} abstract
 * @return {Tree}
 */
function shape (value, older, abstract) {
	var newer = (value !== null && value !== void 0) ? value : text('');

	if (newer.group === void 0) {
		switch (newer.constructor) {
			case Function: {
				if (older === null) {
					newer = element(newer, older);
				} else if (older.group === 2) {
					newer = element(newer, older.owner.props);
				} else {
					newer = element(newer, older.props);
				}
				break;
			}
			case String:
			case Number:
			case Boolean: {
				return text(newer);
			}
			default: {
				switch (newer.constructor) {
					case Promise: {
						if (older === null || older.flag === 0) {
							return text('');
						} else {
							return resolve(older, newer);
						}
					}
					case Array: {
						return fragment(newer);
					}
					case Date: {
						return text(newer+'');
					}
					case Object: {
						return stringify(newer);
					}
					default: {
						if (newer.next !== void 0 && older !== null) {
							newer = coroutine(older, newer);
						} else {
							return text('');
						}
					}
				}
			}
		}
	}

	if (newer.group > 0 && abstract === true) {
		return compose(newer);
	} else {
		return newer;
	}
}

/**
 * Resolve
 *
 * @param {Tree} older
 * @param {Promise} pending
 */
function resolve (older, pending) {
	older.async = 2;

	pending.then(function (value) {
		var newer = value;
		if (older.node === null) {
			return;
		}

		older.async = 0;
		newer = shape(newer, older, true);

		if (older.tag !== newer.tag) {
			exchange(older, newer, false);
		} else {
			patch(older, newer, 0);
		}
	});

	return older.node !== null ? older : text('');;
}

/**
 * Coroutine
 *
 * @param  {Tree} older
 * @param  {Generator} generator
 * @return {Tree}
 */
function coroutine (older, generator) {
	var previous;
	var current;

	older.yield = function () {
		var supply = generator.next(previous);
		var next = supply.value;

		if (supply.done === true) {
			current = shape(next !== void 0 && next !== null ? next : previous, older, true);
		} else {
			current = shape(next, older, true);
		}

		return previous = current;
	};

	return shape(renderBoundary(older, older.group), older, true);
}

/**
 * Fill
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Number} length
 */
function fill (older, newer, length) {
	var children = newer.children;
	var host = older.host;

	for (var i = 0, child; i < length; i++) {
		create(child = children[i], older, shared, 1, host, null);
	}

	older.children = children;
}

/**
 * Animate
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {tree} parent
 * @param  {Promise} pending
 * @param  {Node} node
 */
function animate (older, newer, parent, pending) {
	pending.then(function () {
		if (parent.node === null || older.node === null) {
			return;
		}

		if (newer === shared) {
			removeChild(older, parent);
		} else if (newer.node !== null) {
			replaceChild(older, newer, parent);

			if (newer.group > 0 && newer.owner.componentDidMount !== void 0) {
				mountBoundary(newer, newer.owner, newer.node, 1);
			}
		}

		unmount(older, true);
	});
}

/**
 * Remove
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Tree} parent
 * @return {Tree}
 */
function remove (older, newer, parent) {
	if (older.group > 0 && older.owner.componentWillUnmount !== void 0) {
		var pending = mountBoundary(older, older.owner, older.node, 2);

		if (pending !== void 0 && pending !== null && pending.constructor === Promise) {
			animate(older, newer, parent, pending, older.node);

			return true;
		}
	}

	unmount(older, false);

	if (newer === shared) {
		removeChild(older, parent);
	} else {
		replaceChild(older, newer, parent);
	}

	detach(older);

	return false;
}

/**
 * Unmount
 *
 * @param  {Tree} older
 * @param  {Boolean} unlink
 */
function unmount (older, unlink) {
	var children = older.children;
	var length = children.length;
	var flag = older.flag;

	if (flag > 1) {
		if (length !== 0) {
			for (var i = 0; i < length; i++) {
				var child = children[i];

				if (child.group > 0 && child.owner.componentWillUnmount !== void 0) {
					mountBoundary(child, child.owner, child.node, 2);
				}

				unmount(child, true);
			}
		}

		if (flag < 3 && older.ref !== null) {
			refs(older, older.ref, 0);
		}
	}

	if (unlink === true) {
		detach(older);
	}
}

/**
 * Detach
 *
 * @return {Tree}
 */
function detach (older) {
	older.parent = null;
	older.owner = null;
	older.node = null;
	older.host = null;
}

/**
 * Exchange
 *
 * @param {Tree} newer
 * @param {Tree} older
 * @param {Boolean} deep
 */
function exchange (older, newer, deep) {
	change(older, newer, older.host);
	copy(older, newer, deep);
	update(older.host, newer);
}

/**
 * Update
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 */
function update (older, newer) {
	if (older !== null && older.flag === 3) {
		older.node = newer.node;
		older.parent = newer.parent;

		if (older.host !== older) {
			update(older.host, newer);
		}
	}
}

/**
 * Change
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 */
function change (older, newer) {
	create(newer, older.parent, older, 3, older.host, null);
}
