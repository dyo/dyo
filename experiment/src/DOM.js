/**
 * Generate
 *
 * @param  {Tree} newer
 * @param  {Tree} host
 * @param  {String?} xmlns
 * @return {Node}
 */
function generate (newer, host, xmlns) {
	try {
		if (xmlns === null) {
			return document.createElement(newer.tag);
		} else {
			return document.createElementNS(newer.xmlns === xmlns, newer.tag);
		}
	} catch (err) {
		return errorBoundary(err, host.owner, newer.flag = 3, 0);
	}
}

/**
 * Compose
 *
 * @return {value}
 */
function compose (value) {
	return document.createTextNode(value);
}

/**
 * Insert
 *
 * @param {Tree} newer
 * @param {Tree} sibling
 * @param {Tree} parent
 */
function insert (newer, sibling, parent) {
	parent.node.insertBefore(newer.node, sibling.node);
}

/**
 * Append
 *
 * @param {Tree} newer
 * @param {Tree} parent
 */
function append (newer, parent) {
	parent.node.appendChild(newer.node);
}

/**
 * Remove/Replace
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Tree} parent
 */
function remove (older, newer, parent) {
	var node = older.node;

	if (older.group > 0 && older.owner.componentWillUnmount !== void 0) {
		var pending = mountBoundary(older.owner, node, 2);

		if (pending !== void 0 && pending !== null && pending.constructor === Promise) {
			unmount(older, true);
			wait(older, newer, parent, pending, node);

			return true;
		}
	}

	unmount(older, true);

	if (newer === empty) {
		parent.node.removeChild(node);
	} else {
		parent.node.replaceChild(newer.node, node);
	}

	return false;
}

function wait (older, newer, parent, pending, node) {
	pending.then(function () {
		var anchor = parent.node;
		var next = newer.node;

		if (anchor === null) {
			return;
		}

		if (newer === empty) {
			return void anchor.removeChild(node);
		}

		if (next === null) {
			return;
		}

		anchor.replaceChild(next, node);

		if (newer.group > 0 && newer.owner.componentDidMount !== void 0) {
			mountBoundary(newer.owner, next, 1);
		}
	});
}

/**
 * Clear
 *
 * @param {Tree} older
 */
function clear (older) {
	older.node.textContent = null;
}

/**
 * Text
 *
 * @param {Tree} older
 * @param {String|Number} value
 */
function content (older, value) {
	older.node.nodeValue = value;
}

/**
 * Attribute
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
				assign(6, name, value, xmlns, node);
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
 * Style
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Number} type
 */
function style (older, newer, type) {
	var node = older.node.style;
	var next = newer.attrs.style;

	if (typeof next !== 'string') {
		switch (type) {
			// assign
			case 0: {
				for (var name in next) {
					var value = next[name];

					if (name.charCodeAt(0) === 45) {
						node.setProperty(name, value);
					} else {
						node[name] = value;
					}
				}
				break;
			}
			// update
			case 1: {
				var prev = older.attrs.style;

				for (var name in next) {
					var value = next[name];

					if (name.charCodeAt(0) === 45) {
						node.setProperty(name, value);
					} else {
						node[name] = value;
					}
				}
				break;
			}
		}
	} else {
		node.cssText = next;
	}
}

/**
 * Event
 *
 * @param {Tree} older
 * @param {String} type
 * @param {Function} value
 * @param {Number} action
 */
function event (older, type, value, action) {
	var name = type.toLowerCase().substring(2);
	var host = older.host;
	var node = older.node;
	var fns = node._fns;

	if (fns === void 0) {
		fns = node._fns = {};
	}

	switch (action) {
		case 0: {
			node.removeEventListener(name, proxy);

			if (node._owner !== void 0) {
				node._owner = null;
			}
			break;
		}
		case 1: {
			node.addEventListener(name, proxy);
		}
		case 2: {
			if (host !== null && host.group > 1) {
				node._owner = host.owner;
			}
		}
	}

	fns[name] = value;
}

/**
 * Proxy
 *
 * @param {Event} e
 */
function proxy (e) {
	var type = e.type;
	var fns = this._fns;
	var fn = fns[type];

	if (fn === null || fn === void 0) {
		return;
	}

	var owner = this._owner;

	if (owner !== void 0) {
		eventBoundary(owner, fn, e);
	} else {
		fn.call(this, e);
	}
}
