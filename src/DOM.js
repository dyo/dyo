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
		return errorBoundary(err, host, host.owner, (newer.flag = ERROR, 3), 0);
	}
}

/**
 * Compose
 *
 * @param {(String|Number)} value
 * @return {Node}
 */
function createTextNode (value) {
	return document.createTextNode(value);
}

/**
 * Fragment
 *
 * @return {Node}
 */
function createDocumentFragment () {
	return document.createDocumentFragment();
}

/**
 * Document
 *
 * @return {Node?}
 */
function documentElement () {
	return self.document !== void 0 ? (document.body || document.documentElement) : null;
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
 * @param {Tree} newer
 */
function nodeValue (older, newer) {
	older.node.nodeValue = older.children = newer.children;
}

/**
 * Attribute
 *
 * @param {Number} type
 * @param {String} name
 * @param {Any} value
 * @param {String?} xmlns
 * @param {Boolean} set
 * @param {Tree} node
 */
function setAttribute (type, name, value, xmlns, set, node) {
	switch (type) {
		case 0: {
			if (xmlns === null && (name in node) === true) {
				setUnknown(name, value, node);
			} else if (set === true) {
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
				setAttribute(0, 'class', value, xmlns, set, node);
			}
			break;
		}
		case 3: {
			if ((name in node) === false) {
				node.style.setProperty(name, value);
			} else if (isNaN(Number(value)) === true) {
				setAttribute(0, name, value, xmlns, set, node);
			} else {
				setAttribute(6, name, value, xmlns, set, node);
			}
			break;
		}
		case 4: {
			if (set === true) {
				node.setAttributeNS(xlink, 'href', value);
			} else {
				node.removeAttributeNS(xlink, 'href');
			}
			break;
		}
		case 5:
		case 6: {
			if (xmlns === null) {
				node[name] = value;
			} else {
				setAttribute(0, name, value, xmlns, set, node);
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
 * @param  {Node} node
 */
function setUnknown (name, value, node) {
	try {
		node[name] = value;
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

	if (next.constructor === String) {
		node.cssText = next;
	} else {
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
function setEvent (older, type, value, action) {
	var name = type.toLowerCase().substring(2);
	var host = older.host;
	var node = older.node;
	var handlers = node.that;

	if (handlers === void 0) {
		handlers = node.that = {};
	}

	switch (action) {
		case 0: {
			node.removeEventListener(name, eventBoundary);

			if (handlers.host !== void 0) {
				handlers.host = null;
			}
			break;
		}
		case 1: {
			node.addEventListener(name, eventBoundary);
		}
		case 2: {
			if (host !== null && host.group === CLASS) {
				handlers.host = host;
			}
		}
	}

	handlers[name] = value;
}
