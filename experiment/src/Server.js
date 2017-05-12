/**
 * Stringify Attributes
 *
 * @param  {Tree} newer
 * @return {String}
 */
function attributes (newer) {
	var attrs = newer.attrs;
	var body = '';

	if (attrs === object) {
		return body;
	}

	for (var name in attrs) {
		var value = attrs[name];

		switch (whitelist(name)) {
			case 10: case 21: case 30: case 31: {
				continue;
			}
			case 1: {
				value = ' class="'+sanitize(value)+'"';
				break;
			}
			case 5: {
				value = attrs.value === void 0 ? ' value="'+sanitize(value)+'"' : '';
				break;
			}
			case 20: {
				if (typeof value === 'object') {
					name = '';
					for (var key in value) {
						var val = value[key];

						if (key !== key.toLowerCase()) {
							key = dashcase(key);
						}

						name += key + ':' + val + ';';
					}
					value = name;
				}

				value = ' style="'+sanitize(value)+'"';
				break;
			}
			default: {
				switch (value) {
					case false: case null: case void 0: continue;
					case true: body += ' '+name; continue;
				}

				value = ' '+name+'="'+sanitize(value)+'"';
			}
		}

		body += value;
	}

	return body;
}

/**
 * Sanitize String
 *
 * @param  {String|Boolean|Number} value
 * @return {String}
 */
function sanitize (value) {
	return (value+'').replace(/[<>&"']/g, encode);
}

/**
 * Encode Unicode
 *
 * @param  {String} char
 * @return {String}
 */
function encode (char) {
	return unicodes[char] || char;
}

/**
 * camelCase to dash-case
 *
 * @param  {String} str
 * @return {String}
 */
function dashcase (str) {
	return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase();
}

/**
 * Hollow Nodes
 *
 * @type {Object}
 */
var hollow = {'area': 0, 'base': 0, 'br': 0, '!doctype': 0, 'meta': 0, 'source': 0, 'keygen': 0, 'img': 0,
'col': 0, 'embed': 0, 'wbr': 0, 'track': 0, 'param': 0, 'link': 0, 'input': 0, 'hr': 0};

/**
 * Unicode Characters
 *
 * @type {Object}
 */
var unicodes = {'<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;'};

/**
 * readable
 *
 * @type {Readable}
 */
var readable = require('stream').Readable;

/**
 * To String [Prototype]
 *
 * @return {String}
 */
function toString () {
	var newer = this;
	var group = newer.group;

	if (group > 0) {
		return extract(newer, false).toString();
	}

	var type = newer.type;
	var flag = newer.flag;
	var tag = newer.tag;
	var children = newer.children;
	var body = '';
	var length = 0;

	switch (flag) {
		case 1: return sanitize(children);
		case 6: return '';
	}

	if (newer.attrs !== object && newer.attrs.innerHTML !== void 0) {
		body = newer.attrs.innerHTML;
	} else if ((length = children.length) > 0) {
		for (var i = 0; i < length; i++) {
			body += children[i].toString();
		}
	}

	return '<' + tag + attributes(newer) + '>' + (hollow[tag] !== 0 ? body + '</' + tag + '>' : '');
};

/**
 * String Render
 *
 * @param {Any} newer
 * @return {String}
 */
function renderToString (newer) {
	return shape(newer, null, false).toString();
};

/**
 * Shallow Render
 *
 * @param  {Any} value
 * @return {Tree}
 */
function shallow (value) {
	var newer = shape(value, null, false);

	if (newer.group === 0) {
		return newer;
	}

	return extract(newer, false);
}

/**
 * Stream Render
 *
 * @param {Any} subject
 */
function Stream (subject) {
	this.root = shape(subject, null, true);
	this.stack = [this.root];
	this.size = 1;

	readable.call(this);
}

Stream.prototype = Object.create(readable.prototype, {
	_type: {
		value: 'text/html'
	},
	_read: {
		value: function read () {
			var size = this.size;
			var stack = this.stack;

			if (size === 0) {
				// end
				this.push(null);
			} else {
				// pipe
				var current = stack.pop();
				var children = current.children;

				// push current nodes children to the stack
				for (var i = 0, length = children.length; i < length; i++) {
					stack[size++] = children[i];
				}

				this.size = size;
				this._pipe(current);
			}
		}
	}
	_pipe: {
		value: function pipe (newer) {
			var group = newer.group;

			if (group > 0) {
				return pipe(extract(newer, false));
			}

			var type = newer.type;
			var flag = newer.flag;
			var tag = newer.tag;
			var children = newer.children;
			var length = children.length;

			switch (flag) {
				case 1: return this.push(sanitize(newer.children));
				case 6: return this.push('');
			}

			if (newer.attrs !== object && newer.attrs.innerHTML !== void 0) {
				return this.push(newer.attrs.innerHTML);
			}

			var body = '<' + tag + attributes(newer) + '>';

			if (length === 1 && children[0].flag === 1) {
				// one text child
				body += sanitize(newer.children) + '</' + tag + '>';
			} else if (length === 0) {
				// not children
				if (hollow[tag] !== 0) {
					body += '</' + tag + '>';
				}
			} else {

			}

			this.push(body);
		}
	}
})

/**
 * Exports
 */
exports.shallow = shallow;
exports.renderToString = renderToString;

element.prototype.toString = toString;
