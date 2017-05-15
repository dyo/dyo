module.exports = function (
	exports,
	element,
	shape,
	extract,
	whitelist,
	render,

	ARRAY,
	OBJECT,
	PROPS,

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

		if (attrs === OBJECT) {
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
			case '!doctype':
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
			case 'hr': return true;
			default: return false;
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
	 * Stream
	 *
	 * @param {Any} subject
	 */
	function Stream (newer) {
		this.stack = [newer];

		Readable.call(this);
	}

	/**
	 * Stream Reader
	 *
	 * @return {void}
	 */
	function read () {
		var stack = this.stack;
		var size = stack.length;

		if (size === 0) {
			// end
			this.push(null);
		} else {
			// retrieve element from the stack
			var newer = stack[size-1];

			if (newer.ref === true) {
				// close
				this.push('</' + newer.tag + '>');
			} else {
				// component
				if (newer.group !== STRING) {
					// composite
					while (newer.group !== STRING) {
						newer = extract(newer, false);
					}
				}

				switch (newer.flag) {
					// text
					case TEXT: {
						this.push(sanitize(newer.children));
						break;
					}
					// portal
					case PORTAL: {
						this.push('');
						break;
					}
					default: {
						// innerHTML
						if (newer.attrs !== OBJECT && newer.attrs.innerHTML !== void 0) {
							this.push(newer.attrs.innerHTML);
						} else {
							var type = newer.type;
							var tag = newer.tag;
							var children = newer.children;
							var length = children.length;
							var node = '<' + tag + attributes(newer) + '>';

							if (length === 0) {
								// no children
								this.push(hollow(tag) === true ? node : node + '</' + tag + '>');
							} else if (length === 1 && children[0].flag === TEXT) {
								// one text child
								this.push(node + sanitize(children[0].children) + '</' + tag + '>');
							} else {
								// open
								newer.tag = tag;
								newer.ref = true;

								// push children to the stack, from right to left
								for (var i = length - 1; i >= 0; i--) {
									stack[size++] = children[i];
								}

								return void this.push(node);
							}
						}
					}
				}
			}

			// remove element from stack
			stack.pop();
		}
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
	 * To String [Prototype]
	 *
	 * @return {String}
	 */
	function toString () {
		var newer = this;
		var group = newer.group;

		if (group !== STRING) {
			return extract(newer, false).toString();
		}

		var type = newer.type;
		var flag = newer.flag;
		var tag = newer.tag;
		var children = newer.children;
		var body = '';
		var length = 0;

		switch (flag) {
			case TEXT: return sanitize(children);
			case PORTAL: return '';
		}

		if (newer.attrs !== OBJECT && newer.attrs.innerHTML !== void 0) {
			body = newer.attrs.innerHTML;
		} else if ((length = children.length) > 0) {
			for (var i = 0; i < length; i++) {
				body += children[i].toString();
			}
		}

		return '<' + tag + attributes(newer) + '>' + (hollow(tag) === true ? '' : body + '</' + tag + '>');
	}

	/**
	 * To Stream [Prototype]
	 *
	 * @return {Stream}
	 */
	function toStream () {
		return new Stream(shape(this, null, false));
	}

	/**
	 * String Render
	 *
	 * @param {Any} newer
	 * @return {String}
	 */
	function renderToString (newer) {
		return shape(newer, null, false).toString();
	}

	/**
	 * Stream Render
	 *
	 * @param {Any} subject
	 * @return {Stream}
	 */
	function renderToStream (subject) {
		return new Stream(shape(subject, null, false));
	}

	/**
	 * Server Render
	 *
	 * @param {Any} subject
	 * @param {Node|Stream?} container
	 * @param {Function?} callback
	 */
	exports.render = function (subject, container, callback) {
		if (container === void 0 || container === null || container.writable === void 0) {
			return render(subject, container, callback);
		}

		var newer = new Stream(shape(subject, null, false));

		if (callback !== void 0 && callback !== null && callback.constructor === Function) {
			newer.on('end', callback);
		}

		newer.pipe(container);
	}

	/**
	 * Exports
	 */
	element.prototype.toString = toString;
	element.prototype.toStream = toStream;

	exports.shallow = shallow;
	exports.renderToString = renderToString;
	exports.renderToStream = renderToStream;
};
