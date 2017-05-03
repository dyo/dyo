module.exports = function (API, element, shape, extract, attr, object) {
	/**
	 * Stringify [Prototype]
	 *
	 * @param {Boolean?} slot
	 * @return {String}
	 */
	element.prototype.toString = function toString (slot) {
		var newer = this;
		var group = newer.group;

		if (group > 0) {
			return extract(newer, false).toString(true);
		}

		var type = newer.type;
		var flag = newer.flag;
		var tag = newer.tag;
		var children = newer.children;
		var body = '';
		var length = 0;

		if (flag === 1) {
			return sanitize(children);
		}

		if (newer.props !== object && newer.props.innerHTML !== void 0) {
			body = newer.props.innerHTML;
		} else if ((length = children.length) > 0) {
			for (var i = 0; i < length; i++) {
				body += children[i].toString(false);
			}
		}

		return (
			('<' + tag + attrs(newer) + (slot === true ? ' slot' : '') + '>') +
			(hollow[tag] !== 0 ? body + '</' + tag + '>' : '')
		);
	};

	/**
	 * Stringify [API]
	 *
	 * @param {Any} newer
	 * @return {String}
	 */
	API.renderToString = function toString (newer) {
		return shape(newer, null, false).toString(true);
	};

	/**
	 * Shallow Render
	 *
	 * @param  {Any} value
	 * @return {Tree}
	 */
	API.shallow = function shallow (value) {
		var newer = shape(value, null, false);

		if (newer.group === 0) {
			return newer;
		}

		return extract(newer, false);
	}

	/**
	 * Stringify Attributes
	 *
	 * @param  {Tree} newer
	 * @return {String}
	 */
	function attrs (newer) {
		var props = newer.props;
		var body = '';
		var value;
		var val;

		if (props === object) {
			return body;
		}

		for (var name in props) {
			value = props[name];

			switch (attr(name)) {
				case 10: case 21: case 30: case 31: {
					continue;
				}
				case 1: {
					value = ' class="'+sanitize(value)+'"';
					break;
				}
				case 5: {
					value = props.value === void 0 ? ' value="'+sanitize(value)+'"' : '';
					break;
				}
				case 20: {
					if (typeof value === 'object') {
						name = '';
						for (var key in value) {
							val = value[key];
							if (key !== key.toLowerCase()) {
								key = dashCase(key);
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
	function dashCase (str) {
		return str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase();
	}

	// hollow nodes
	var hollow = {
		'area': 0,
		'base': 0,
		'br': 0,
		'!doctype': 0,
		'col': 0,
		'embed': 0,
		'wbr': 0,
		'track': 0,
		'hr': 0,
		'img': 0,
		'input': 0,
		'keygen': 0,
		'link': 0,
		'meta': 0,
		'param': 0,
		'source': 0
	};

	// unicode characters
	var unicodes = {
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'&': '&amp;'
	};
};
