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
	var newer = new Tree(2);
	var proto;
	var children;

	if (props !== null) {
		switch (props.constructor) {
			case Object: {
				if (props.key !== void 0) {
					newer.key = props.key;
				}
				if (props.xmlns !== void 0) {
					newer.xmlns = props.xmlns;
				}
				newer.props = props;
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
			newer.tag = type;
			newer.attrs = props;
			break;
		}
		case Function: {
			if ((proto = type.prototype) !== void 0 && proto.render !== void 0) {
				group = newer.group = 2;
			} else {
				group = newer.group = 1;
				newer.owner = type;
			}
			break;
		}
	}

	newer.type = type;

	if (length > 1) {
		children = new Array(size);

		if (group < 1) {
			for (newer.children = children; i < length; i++) {
				index = push(newer, index, arguments[i]);
			}
		} else {
			if ((props = newer.props) === null || props === object) {
				props = newer.props = {};
			}
			for (newer.children = children; i < length; i++) {
				index = pull(newer, index, arguments[i]);
			}

			props.children = index > 1 ? children : children[0];
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
 * @param  {Any} decedent
 * @return {Number}
 */
function push (newer, index, decedent) {
	var children = newer.children;
	var child;
	var length;

	if (decedent === null || decedent === void 0) {
		child = text('');
	} else if (decedent.group !== void 0) {
		if (newer.keyed === false && decedent.key !== null) {
			newer.keyed = true;
		}
		child = decedent;
	} else {
		switch (typeof decedent) {
			case 'function': {
				child = element(decedent, null);
				break;
			}
			case 'object': {
				if ((length = decedent.length) !== void 0) {
					for (var j = 0, i = index; j < length; j++) {
						i = push(newer, i, decedent[j]);
					}
					return i;
				} else {
					child = text(decedent.constructor === Date ? decedent+'' : '');
				}
				break;
			}
			default: {
				child = text(decedent);
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
 * @param  {Any} decedent
 * @return {Number}
 */
function pull (newer, index, decedent) {
	var children = newer.children;

	if (decedent !== null && typeof decedent === 'object') {
		var length = decedent.length;

		if (length !== void 0) {
			for (var j = 0, i = index; j < length; j++) {
				i = pull(newer, i, decedent[j]);
			}
			return i;
		}
	}
	children[index] = decedent;

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
 * Tree Prototype
 *
 * @type {Object}
 */
var TreePrototype = Tree.prototype = element.prototype = Object.create(null);
