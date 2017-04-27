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
	var size = 0;
	var index = 0;
	var i = 2;
	var group = 0;
	var older = new Tree(2);
	var proto;
	var children;

	if (props !== null) {
		switch (props.constructor) {
			case Object: {
				if (props.key !== void 0) {
					older.key = props.key;
				}
				if (props.xmlns !== void 0) {
					older.xmlns = props.xmlns;
				}
				older.props = props;
				break;
			}
			case Array: {
				size = props.length;
			}
			default: {
				props = object;
				i = 1;
			}
		}
	}

	switch (type.constructor) {
		case String: {
			older.tag = type;
			older.attrs = props;
			break;
		}
		case Function: {
			if ((proto = type.prototype) !== void 0 && proto.render !== void 0) {
				group = older.group = 2;
			} else {
				group = older.group = 1;
				older.owner = type;
			}
			break;
		}
	}

	older.type = type;

	if (length > 1) {
		children = new Array(size);

		if (group < 1) {
			for (older.children = children; i < length; i++) {
				index = push(older, index, arguments[i]);
			}
		} else {
			if ((props = older.props) === null || props === object) {
				props = older.props = {};
			}

			for (older.children = children; i < length; i++) {
				index = pull(older, index, arguments[i]);
			}

			props.children = children;
			older.children = array;
		}
	}

	return older;
}

/**
 * Push Children
 *
 * @param  {Tree} older
 * @param  {Number} index
 * @param  {Any} newer
 * @return {Number}
 */
function push (older, index, newer) {
	var children = older.children;
	var child;
	var length;

	if (newer === null || newer === void 0) {
		child = text('');
	} else if (newer.group !== void 0) {
		if (older.keyed === false && newer.key !== null) {
			older.keyed = true;
		}
		child = newer;
	} else {
		switch (typeof newer) {
			case 'function': {
				child = element(newer, null);
				break;
			}
			case 'object': {
				if ((length = newer.length) !== void 0) {
					for (var j = 0, i = index; j < length; j++) {
						i = push(older, i, newer[j]);
					}
					return i;
				} else {
					child = text(newer.constructor === Date ? newer+'' : '');
				}
				break;
			}
			default: {
				child = text(newer);
			}
		}
	}

	children[index] = child;

	return index + 1;
}

/**
 * Pull Children
 *
 * @param  {Tree} older
 * @param  {Number} index
 * @param  {Any} newer
 * @return {Number}
 */
function pull (older, index, newer) {
	var children = older.children;

	if (newer !== null && typeof newer === 'object') {
		var length = newer.length;

		if (length !== void 0) {
			for (var j = 0, i = index; j < length; j++) {
				i = pull(older, i, newer[j]);
			}
			return i;
		}
	}

	children[index] = newer;

	return index + 1;
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
	newer.children = (value === true || value === false) ? '' : value;

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
 * Copy Tree
 *
 * @param  {Tree} older
 * @param  {Tree} newer
 * @param  {Boolean} deep
 */
function copy (older, newer, deep) {
	older.flag = newer.flag;
	older.tag = newer.tag;
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
 * Tree
 *
 * @param {Number} flag
 */
function Tree (flag) {
	this.flag = flag;
	this.tag = null;
	this.key = null;
	this.type = null;
	this.node = null;
	this.host = null;
	this.group = 0;
	this.async = 0;
	this.props = object;
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
var Prototype = Tree.prototype = element.prototype = Object.create(null);
