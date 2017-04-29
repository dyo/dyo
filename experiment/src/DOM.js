/**
 * Generate
 *
 * @param  {String} tag
 * @param  {Tree} newer
 * @param  {Tree} host
 * @param  {String?} xmlns
 * @return {Node}
 */
function createElement (tag, newer, host, xmlns) {
	try {
		if (xmlns === null) {
			return document.createElement(tag);
		} else {
			return document.createElementNS(newer.xmlns = xmlns, tag);
		}
	} catch (err) {
		return errorBoundary(err, host, host.owner, newer.flag = 5, 0);
	}
}

/**
 * Compose
 *
 * @return {value}
 */
function createTextNode (value) {
	return document.createTextNode(value);
}

/**
 * Insert
 *
 * @param {Tree} newer
 * @param {Tree} sibling
 * @param {Tree} parent
 */
function insertBefore (newer, sibling, parent) {
	parent.node.insertBefore(newer.node, sibling.node);
}

/**
 * Append
 *
 * @param {Tree} newer
 * @param {Tree} parent
 */
function appendChild (newer, parent) {
	parent.node.appendChild(newer.node);
}

/**
 * Remove
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Tree} parent
 */
function removeChild (older, parent) {
	parent.node.removeChild(older.node);
}

/**
 * Replace
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Tree} parent
 */
function replaceChild (older, newer, parent) {
	parent.node.replaceChild(newer.node, older.node);
}

/**
 * Remove All
 *
 * @param {Tree} older
 */
function removeChildren (older) {
	older.node.textContent = null;
}

/**
 * Text
 *
 * @param {Tree} older
 * @param {String|Number} value
 */
function nodeValue (older, value) {
	older.node.nodeValue = value;
}

/**
 * Attribute
 *
 * @param {Number} type
 * @param {String} name
 * @param {Any} value
 * @param {String?} xmlns
 * @param {Tree} node
 */
function setAttribute (type, name, value, xmlns, node) {
	switch (type) {
		case 0: {
			if (xmlns === null && name in node) {
				setUnknown(name, value, newer);
			} else if (value !== null && value !== void 0 && value !== false) {
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
				setAttribute(0, 'class', value, xmlns, node);
			}
			break;
		}
		case 3: {
			if (node[name] === void 0) {
				node.style.setProperty(name, value);
			} else if (isNaN(Number(value)) === true) {
				setAttribute(0, name, value, xmlns, node);
			} else {
				setAttribute(6, name, value, xmlns, node);
			}
			break;
		}
		case 4: {
			node.setAttributeNS(xlink, 'href', value);
			break;
		}
		case 5:
		case 6: {
			if (xmlns === null) {
				node[name] = value;
			} else {
				setAttribute(0, name, value, xmlns, node);
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
 * Unknown
 *
 * @param  {String} name
 * @param  {Any} value
 * @param  {Tree} newer
 */
function setUnknown (name, value, newer) {
	try {
		newer.node[name] = value;
	} catch (e) {}
}

/**
 * Style
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Number} type
 */
function setStyle (older, newer, type) {
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
 * @param {Node} node
 */
function eventListener (older, type, value, action, node) {
	var name = type.toLowerCase().substring(2);
	var host = older.host;
	var fns = node._fns;

	if (fns === void 0) {
		fns = node._fns = {};
	}

	switch (action) {
		case 0: {
			node.removeEventListener(name, proxy);

			if (node._this !== void 0) {
				node._this = null;
			}
			break;
		}
		case 1: {
			node.addEventListener(name, proxy);
		}
		case 2: {
			if (host !== null && host.group > 1) {
				node._this = older;
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
	var older;

	if (fn === null || fn === void 0) {
		return;
	}

	if ((older = this._this) !== void 0) {
		eventBoundary(older, older.host.owner, fn, e);
	} else {
		fn.call(this, e);
	}
}
