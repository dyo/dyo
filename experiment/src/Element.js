/**
 * Create Element
 *
 * @param  {String|Function} _type
 * @param  {...} _props
 * @return {Tree}
 */
function element (_type, _props) {
	var type = _type;
	var props = _props !== void 0 ? _props : null;
	var length = arguments.length;
	var children = length !== 1 ? [] : array;
	var newer = new Tree(2);
	var index = 0;
	var i = 2;
	var proto;

	if (props !== null) {
		if (props.group !== void 0 || props.constructor !== Object) {
			props = object;
			i = 1;
		} else {
			newer.props = props;

			if (props.key !== void 0) {
				newer.key = props.key;
			}
			if (props.xmlns !== void 0) {
				newer.xmlns = props.xmlns;
			}
		}
	}

	switch (typeof type) {
		case 'string': {
			newer.tag = type;
			newer.attrs = props;
			break;
		}
		case 'function': {
			if ((proto = type.prototype) !== void 0 && proto.render !== void 0) {
				newer.group = 2;
			} else {
				newer.group = 1;
				newer.owner = type;
			}
			break;
		}
		default: {
			newer.tag = 'noscript';
		}
	}

	newer.type = type;
	newer.children = children;

	if (length !== 1) {
		for (; i < length; i++) {
			index = adopt(newer, index, arguments[i]);
		}
	}
	return newer;
}

/**
 * Adopt Element Children
 *
 * @param  {Tree} newer
 * @param  {Number} index
 * @param  {Any} child
 * @return {Number}
 */
function adopt (newer, index, child) {
	var children = newer.children;
	var i = index;
	var length;

	if (child === null || child === void 0) {
		children[i] = text('');
	} else if (child.group !== void 0) {
		if (newer.keyed === false) {
			if (child.key !== null) {
				newer.keyed = true;
			}
		} else if (child.key === null) {
			// assign float key to non-keyed children in a keyed structure
			// an obscure floating point key avoids conflicts with int keyed children
			child.key = index/161800;
		}
		children[i] = child;
	} else {
		switch (typeof child) {
			case 'function': {
				children[i] = element(child, null);
				break;
			}
			case 'object': {
				if ((length = child.length) > 0) {
					for (var j = 0; j < length; j++) {
						i = adopt(newer, i, child[j]);
					}
					return i;
				} else if (child.constructor === Date) {
					return adopt(newer, i, text(child+''));
				} else {
					return adopt(newer, i, text(''));
				}
			}
			default: {
				return adopt(newer, i, text(child));
			}
		}
	}
	return i + 1;
}

/**
 * Create Text
 *
 * @param  {String|Number|Boolean} value
 * @param  {Tree}
 * @return {Tree}
 */
function text (value) {
	var newer = new Tree(1);

	newer.type = newer.tag = '#text';
	newer.children = ((value === true || value === false) ? '' : value);

	return newer;
}

/**
 * Create Fragment
 *
 * @param  {Array<Tree>|Tree|Function} children
 * @return {Tree}
 */
function fragment (children) {
	return element('section', null, children);
}

/**
 * Copy Tree [Shallow]
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 */
function copy (older, newer) {
	older.tag = newer.tag;
	older.flag = newer.flag;
	older.node = newer.node;
	older.attrs = newer.attrs;
	older.keyed = newer.keyed;
	older.xmlns = newer.xmlns;
	older.children = newer.children;
}

/**
 * Clone Tree [Deep]
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Boolean} type
 */
function clone (older, newer, type) {
	older.flag = newer.flag;
	older.tag = newer.tag;
	older.node = newer.node;
	older.attrs = newer.attrs;
	older.xmlns = newer.xmlns;
	older.async = newer.async;
	older.keyed = newer.keyed;
	older.parent = newer.parent;
	older.children = newer.children;

	switch (type) {
		case 1: {
			older.props = newer.props;
			older.owner = newer.owner;
			older.type = newer.type;
			older.group = newer.group;
			older.host = newer.host;
			older.key = newer.key;
			break;
		}
		case 2: {
			older.host = newer.owner === 'function' ? shape(newer.owner, newer) : newer;
			break;
		}
	}
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
	this.type = null;
	this.host = null;
	this.node = null;
	this.group = 0;
	this.async = 0;
	this.props = object;
	this.attrs = object;
	this.xmlns = null;
	this.owner = null;
	this.keyed = false;
	this.parent = null;
	this.children = null;
}

/**
 * Tree Prototype
 *
 * @type {Object}
 */
var TreePrototype = Tree.prototype = element.prototype = Object.create(null);
