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
	var newer = new Tree(2);

	switch (props) {
		case null: {
			props = properties;
			attrs = object;
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
					props = properties;
					attrs = object;
					i = 1;
				}
			}
		}
	}

	switch (type.constructor) {
		// node
		case String: {
			newer.tag = type;
			newer.attrs = attrs;

			break;
		}
		// component
		case Function: {
			var proto = type.prototype;

			newer.group = group = proto !== void 0 && proto.render !== void 0 ? 2 : 1;

			break;
		}
		default: {
			if (type.flag !== void 0) {
				// clone
				merge(type.props, props);

				if ((type = type.type, group = type.group) === 0) {
					newer.tag = type;
				} else {
					newer.props.children = array;
				}
			} else if (type.nodeType !== void 0) {
				newer.flag = 6;
			}
		}
	}

	newer.type = type;

	if (length - offset > 1) {
		var children = newer.children = new Array(size);
		var index = 0;

		if (group < 1) {
			for (; i < length; i++) {
				index = push(newer, index, arguments[i]);
			}
		} else {
			if (props === properties) {
				props = newer.props = {};
			}

			for (; i < length; i++) {
				index = pull(newer, index, arguments[i]);
			}

			props.children = children;
			newer.children = array;
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
		child = text('');
	} else if (value.group !== void 0) {
		if (newer.keyed === false && value.key !== null) {
			newer.keyed = true;
		}

		child = value;
	} else {
		switch (value.constructor) {
			case Number:
			case String: {
				child = new Tree(1);
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
				child = text('');
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
	var newer = new Tree(1);

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
	var newer = new Tree(4);

	newer.tag = newer.type = 'div';

	for (var i = 0, index = 0, length = children.length; i < length; i++) {
		index = push(newer, index, children[i]);
	}

	return newer;
}

/**
 * Compose
 *
 * @param  {Tree} child
 * @return {Tree}
 */
function compose (child) {
	var newer = new Tree(3);

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
		return text('');
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
		older.group = newer.group;
		older.type = newer.type;
		older.host = newer.host;
		older.key = newer.key;
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
	return (assign(older, newer, deep), older);
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
	this.group = 0;
	this.async = 0;
	this.props = properties;
	this.attrs = object;
	this.xmlns = null;
	this.owner = null;
	this.yield = null;
	this.keyed = false;
	this.parent = null;
	this.children = array;
}

/**
 * Prototype
 *
 * @type {Object}
 */
var TreePrototype = Tree.prototype = element.prototype = Object.create(null);
