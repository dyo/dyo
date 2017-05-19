module.exports = function (
	dio, element, shape, extract, whitelist, render, renderBoundary,
	CHILDREN, PROPS, ATTRS,
	READY, PROCESSING, PROCESSED, PENDING,
	STRING, FUNCTION, CLASS, NOOP,
	EMPTY, TEXT, ELEMENT, COMPOSITE, FRAGMENT, ERROR, PORTAL
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
				case 10: {
					newer.ref = false;
				}
				case 21: case 30: case 31: {
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
			case 'hr': return 3;
			case '!doctype': return 2;
			case 'script': return 1;
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
		var chunk = '<' + tag + attributes(newer);
		var length = 0;

		// innerHTML
		if (newer.ref === false) {
			chunk += '>' + newer.attrs.innerHTML;
			newer.ref = null;
		} else {
			if ((length = children.length) > 0) {
				if (type === 2) {
					chunk += ' ' + (tag = 'html');
				}

				chunk += '>';

				if (type === 1 && length === 1) {
					chunk += children[0].children;
				} else {
					for (var i = 0; i < length; i++) {
						chunk += children[i].toString();
					}
				}
			} else {
				chunk += '>';
			}
		}

		if (type < 3) {
			chunk += '</' + tag + '>';
		}

		return chunk;
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
			var older = stack[size-1];
			var newer = older;
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

						if (newer.async === PENDING) {
							var that = this;

							newer.owner.state.then(function (state) {
								newer.async = READY;
								newer.owner.state = state;

								newer = renderBoundary(newer, newer.group);
								newer = shape(newer, newer, false);

								// continue
								stack[size-1] = newer;
								read.call(that);
							});

							return;
						}
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
						var attrs = newer.attrs;

						chunk = '<' + (tag = newer.tag) + attributes(newer);

						// innerHTML
						if (newer.ref === false) {
							chunk += '>' + newer.attrs.innerHTML;
							pop = false;
						} else {
							var children = newer.children;
							var length = children.length;
							var type = hollow(tag);

							if (length === 0) {
								chunk += '>';

								// no children
								if (type < 3) {
									chunk += '</' + tag + '>';
								}
							} else {
								if (type === 2) {
									chunk += ' ' + (tag = 'html');
								}

								chunk += '>';

								var child;

								if (length === 1 && (child = children[0]).flag === TEXT) {
									// one text child
									chunk += type === 1 ? child.children : sanitize(child.children);
									chunk += '</' + tag + '>';
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
			}

			// remove element from stack
			if (pop === true) {
				stack.pop();
			} else {
				older.tag = tag;
				older.ref = true;
			}

			// send next chunk
			this.push(chunk);
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
	dio.render = function (subject, target, callback) {
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

	dio.shallow = shallow;
	dio.stream = stream;
};
