/**
 * Element
 *
 * @param  {String|Function} _type
 * @param  {...} _props
 * @return {Tree}
 */
function element (_type, _props) {
	var type = _type;
	var props = _props !== void 0 ? _props : null;
	var attrs = props;
	var length = arguments.length;
	var size = 0;
	var offset = 0;
	var i = 2;
	var group = 0;
	var newer = new Tree(ELEMENT);

	switch (props) {
		case null: {
			props = PROPS;
			attrs = ATTRS;
			offset++;
			break;
		}
		default: {
			switch (props.constructor) {
				case Object: {
					if (props.key !== void 0) {
						newer.key = props.key;
					}
					if (props.xmlns !== void 0) {
						newer.xmlns = props.xmlns;
					}

					offset++;
					newer.props = props;

					break;
				}
				case Array: {
					size = props.length;
				}
				default: {
					props = PROPS;
					attrs = ATTRS;
					i = 1;
				}
			}
		}
	}

	switch (type.constructor) {
		// fragment
		case Array: {
			return fragment(type);
		}
		// import
		case Promise: {
			newer.tag = 'div';
			newer.attrs = attrs;
			newer.flag = FRAGMENT;
			break;
		}
		// node
		case String: {
			newer.tag = type;
			newer.attrs = attrs;
			break;
		}
		// component
		case Function: {
			var proto = type.prototype;

			if (proto !== void 0 && proto.render !== void 0) {
				// class component
				group = CLASS;
			} else if (type.ELEMENT_NODE !== 1) {
				// function component
				group = FUNCTION;
			} else {
				// custom element
				group = STRING;
				newer.flag = CUSTOM;
				newer.tag = type;
				newer.attrs = attrs;
			}

			newer.group = group;
			break;
		}
		default: {
			if (type.ELEMENT_NODE === 1) {
				// portal
				newer.flag = PORTAL;
				newer.tag = type;
				newer.attrs = attrs;
			}	else if (type.flag !== void 0) {
				// clone
				if (type.props !== PROPS) {
					if (props === PROPS) {
						props = newer.props = {};
						attrs = newer.attrs = {};
					}

					merge(type.props, props);
					merge(type.attrs, attrs);
				}

				group = newer.group = type.group;
				type = type.type;

				if (group === STRING) {
					newer.tag = type;
				} else {
					props.children = CHILDREN;
				}
			}
		}
	}

	newer.type = type;

	if (length - offset > 1) {
		var children = newer.children = new Array(size);
		var index = 0;

		if (group === 0) {
			for (; i < length; i++) {
				index = push(newer, index, arguments[i]);
			}
		} else {
			if (props === PROPS) {
				props = newer.props = {};
			}

			for (; i < length; i++) {
				index = pull(newer, index, arguments[i]);
			}

			props.children = children;
			newer.children = CHILDREN;
		}
	}

	return newer;
}

/**
 * Push Children
 *
 * @param  {Tree} newer
 * @param  {Number} index
 * @param  {Any} value
 * @return {Number}
 */
function push (newer, index, value) {
	var children = newer.children;
	var child;

	if (value === null || value === void 0) {
		child = text(' ');
	} else if (value.group !== void 0) {
		if (newer.keyed === 0 && value.key !== null) {
			newer.keyed = 1;
		}

		child = value;
	} else {
		switch (value.constructor) {
			case String: {
				if (value.length === 0) {
					value = ' ';
				}
			}
			case Number: {
				child = new Tree(TEXT);
				child.type = child.tag = '#text';
				child.children = value;
				break;
			}
			case Array: {
				for (var j = 0, i = index, length = value.length; j < length; j++) {
					i = push(newer, i, value[j]);
				}
				return i;
			}
			case Promise:
			case Function: {
				child = element(value);
				break;
			}
			case Object: {
				child = stringify(value);
				break;
			}
			case Date: {
				child = text(value.toString());
				break;
			}
			default: {
				child = value.ELEMENT_NODE === 1 ? element(value) : text(' ');
				break;
			}
		}
	}

	children[index] = child;

	return index + 1;
}

/**
 * Pull Children
 *
 * @param  {Tree} newer
 * @param  {Number} index
 * @param  {Any} value
 * @return {Number}
 */
function pull (newer, index, value) {
	var children = newer.children;

	if (value !== null && value !== void 0 && value.constructor === Array) {
		for (var j = 0, i = index, length = value.length; j < length; j++) {
			i = pull(newer, i, value[j]);
		}

		return i;
	}

	children[index] = value;

	return index + 1;
}

/**
 * Text
 *
 * @param  {String|Number|Boolean} value
 * @param  {Tree}
 * @return {Tree}
 */
function text (value) {
	var newer = new Tree(TEXT);

	newer.type = newer.tag = '#text';
	newer.children = value;

	return newer;
}

/**
 * Fragment
 *
 * @param  {Array<Tree>|Tree|Function} children
 * @return {Tree}
 */
function fragment (children) {
	var newer = new Tree(FRAGMENT);

	newer.tag = newer.type = 'div';
	newer.children = children;

	for (var i = 0, index = 0, length = children.length; i < length; i++) {
		index = push(newer, index, children[i]);
	}

	return newer;
}

/**
 * Compose
 *
 * @param {Tree} child
 * @return {Tree}
 */
function compose (child) {
	var newer = new Tree(COMPOSITE);

	newer.children = [child];

	return newer;
}

/**
 * Stringify
 *
 * @param {Object} value
 * @return {Tree}
 */
function stringify (value) {
	try {
		return element('pre', null, JSON.stringify(value, null, 2));
	} catch (err) {
		return text(' ');
	}
}

/**
 * Assign
 *
 * @param {Tree} older
 * @param {Tree} newer
 * @param {Boolean} deep
 */
function assign (older, newer, deep) {
	older.flag = newer.flag;
	older.tag = newer.tag;
	older.ref = newer.ref;
	older.node = newer.node;
	older.attrs = newer.attrs;
	older.xmlns = newer.xmlns;
	older.async = newer.async;
	older.keyed = newer.keyed;
	older.children = newer.children;

	if (deep === true) {
		older.parent = newer.parent;
		older.props = newer.props;
		older.owner = newer.owner;
		older.yield = newer.yield;
		older.type = newer.type;
		older.host = newer.host;
		older.key = newer.key;

		if ((older.group = newer.group) === CLASS) {
			older.owner.this = older;
		}
	}
}

/**
 * Clone
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Boolean} deep
 * @return {Tree}
 */
function clone (older, newer, deep) {
	assign(older, newer, deep);
	return older;
}

/**
 * Tree
 *
 * @param {Number} flag
 */
function Tree (flag) {
	this.flag = flag;
	this.tag = null;
	this.key = null;
	this.ref = null;
	this.type = null;
	this.node = null;
	this.host = null;
	this.group = STRING;
	this.async = READY;
	this.props = PROPS;
	this.attrs = ATTRS;
	this.xmlns = null;
	this.owner = null;
	this.yield = null;
	this.keyed = 0;
	this.parent = null;
	this.children = CHILDREN;
}

/**
 * Prototype
 *
 * @type {Object}
 */
Tree.prototype = element.prototype = Object.create(null);
