module.exports = function (
	exports,
	element,
	shape,
	extract,
	whitelist,
	render,
	stringify,

	CHILDREN,
	PROPS,
	ATTRS,

	READY,
	PROCESSING,
	PROCESSED,
	PENDING,

	STRING,
	FUNCTION,
	CLASS,
	NOOP,

	EMPTY,
	TEXT,
	ELEMENT,
	COMPOSITE,
	FRAGMENT,
	ERROR,
	PORTAL
) {
	var contentType = 'Content-Type';
	var encodingType = 'text/html';


	/**
	 * Readable
	 *
	 * @type {Readable}
	 */
	var Readable = require('stream').Readable;

	/**
	 * Stringify Attributes
	 *
	 * @param  {Tree} newer
	 * @return {String}
	 */
	function attributes (newer) {
		var attrs = newer.attrs;
		var body = '';

		if (attrs === ATTRS) {
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
		switch (char) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '"': return '&quot;';
			case "'": return '&#x27;';
			case '&': return '&amp;';
			default: return char;
		}
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
	 * Hollow
	 *
	 * @param {String}
	 * @return {Boolean}
	 */
	function hollow (name) {
		switch (name) {
			case 'area':
			case 'base':
			case 'br':
			case 'meta':
			case 'source':
			case 'keygen':
			case 'img':
			case 'col':
			case 'embed':
			case 'wbr':
			case 'track':
			case 'param':
			case 'link':
			case 'input':
			case 'hr': return 2;
			case '!doctype': return 1;
			default: return 0;
		}
	}

	/**
	 * Shallow Render
	 *
	 * @param  {Any} value
	 * @return {Tree}
	 */
	function shallow (value) {
		var newer = shape(value, null, false);

		if (newer.group === STRING) {
			return newer;
		}

		return extract(newer, false);
	}

	/**
	 * To String [Prototype]
	 *
	 * @return {String}
	 */
	function toString () {
		var newer = this;
		var group = newer.group;
		var type = newer.type;

		if (group !== STRING) {
			return extract(newer, false).toString();
		}

		var children = newer.children;

		switch (newer.flag) {
			case TEXT: return sanitize(children);
			case PORTAL: return '';
		}


		var tag = newer.tag;
		var type = hollow(tag);
		var body = '<' + tag + attributes(newer) + '>';
		var length = 0;

		if (newer.attrs !== ATTRS && newer.attrs.innerHTML !== void 0) {
			body += newer.attrs.innerHTML;
		} else if ((length = children.length) > 0) {
			for (var i = 0; i < length; i++) {
				body += children[i].toString();
			}

			if (type === 1) {
				tag = 'html';
			}
		}

		if (type < 2) {
			body += '</' + tag + '>';
		}

		return body;
	}

	/**
	 * Reader
	 *
	 * @return {void}
	 */
	function read () {
		var stack = this._stack;
		var size = stack.length;

		if (size === 0) {
			// end
			this.push(null);
		} else {
			// retrieve element from the stack
			var newer = stack[size-1];
			var pop = true;
			var chunk = '';
			var tag = '';

			if (newer.ref === true) {
				// close
				switch (tag = newer.tag) {
					case '!doctype': chunk = '</html>'; break;
					default: chunk = '</' + tag + '>';
				}
			} else {
				var group = newer.group;

				// component
				if (group > STRING) {
					// composite
					while ((group = newer.group) > STRING) {
						newer = extract(newer, false);
					}
				}

				switch (newer.flag) {
					// text
					case TEXT: {
						chunk = group === STRING ? sanitize(newer.children) : newer.children;
						break;
					}
					// portal
					case PORTAL: {
						break;
					}
					default: {
						chunk = '<' + (tag = newer.tag) + attributes(newer) + '>';

						// innerHTML
						if (newer.attrs !== ATTRS && newer.attrs.innerHTML !== void 0) {
							chunk += newer.attrs.innerHTML;
							pop = false;
						} else {
							var children = newer.children;
							var length = children.length;

							if (length === 0) {
								// no children
								if (hollow(tag) < 1) {
									chunk += '</' + tag + '>';
								}
							} else if (length === 1 && children[0].flag === TEXT) {
								// one text child
								chunk += sanitize(children[0].children) + '</' + tag + '>';
							} else {
								pop = false;

								// push children to the stack, from right to left
								for (var i = length - 1; i >= 0; i--) {
									stack[size++] = children[i];
								}
							}
						}
					}
				}
			}

			// send next chunk
			this.push(chunk);

			// remove element from stack
			if (pop === true) {
				stack.pop();
			} else {
				newer.tag = tag;
				newer.ref = true;
			}
		}
	}

	/**
	 * Stream
	 *
	 * @param {Any} parent
	 */
	function Stream (parent) {
		this._stack = [shape(parent, null, false)];

		Readable.call(this);
	}

	/**
	 * Stream Prototype
	 *
	 * @type {Object}
	 */
	Stream.prototype = Object.create(Readable.prototype, {
		_type: {value: 'text/html'},
		_read: {value: read}
	});

	/**
	 * To Stream [Prototype]
	 *
	 * @return {Stream}
	 */
	function stream (subject) {
		return new Stream(subject);
	}

	/**
	 * Server Render
	 *
	 * @param {Any} subject
	 * @param {Node|Stream?} target
	 * @param {Function?} callback
	 */
	exports.render = function (subject, target, callback) {
		if (target !== void 0 && target !== null && target.writable !== void 0) {
			var newer = new Stream(subject);

			if (typeof target.getHeader === 'function' && target.getHeader(contentType) === void 0) {
				if (subject !== null && subject !== void 0) {
					switch (subject.constructor) {
						case Object: {
							(newer._stack[0] = newer._stack[0].children[0]).group = -1;
							encodingType = 'application/json';
							break;
						}
						default: {
							encodingType = 'text/html';
						}
					}
					target.setHeader(contentType, encodingType);
				}
			}

			if (callback !== void 0 && callback !== null && callback.constructor === Function) {
				newer.on('end', callback);
			}

			return newer.pipe(newer._target = target), newer;
		}

		return render(subject, target, callback);
	}

	/**
	 * Exports
	 */
	element.prototype.toString = toString;

	exports.shallow = shallow;
	exports.stream = stream;
};
