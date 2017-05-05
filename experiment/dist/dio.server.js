module.exports = function (exports, element, shape, extract, whitelist, object) {
	/**
	 * Stringify Attributes
	 *
	 * @param  {Tree} newer
	 * @return {String}
	 */
	function attributes (newer) {
		var props = newer.props;
		var body = '';
	
		if (props === object) {
			return body;
		}
	
		for (var name in props) {
			var value = props[name];
	
			switch (whitelist(name)) {
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
	
		if (newer.props !== object && newer.props.innerHTML !== void 0) {
			body = newer.props.innerHTML;
		} else if ((length = children.length) > 0) {
			for (var i = 0; i < length; i++) {
				body += children[i].toString(false);
			}
		}
	
		return '<' + tag + attributes(newer) + '>' + (hollow[tag] !== 0 ? body + '</' + tag + '>' : '');
	};
	
	/**
	 * Render To String
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
	 * Exports
	 */
	exports.shallow = shallow;
	exports.renderToString = renderToString;
	
	element.prototype.toString = toString;
	
};
