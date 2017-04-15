// empty nodes
var empty = {'area': 0, 'base': 0, 'br': 0, '!doctype': 0, 'col': 0, 'embed': 0, 'wbr': 0, 'track': 0,
'hr': 0, 'img': 0, 'input': 0, 'keygen': 0, 'link': 0, 'meta': 0, 'param': 0, 'source': 0};

// unicode characters
var unicodes = {'<': '&lt;', '>': '&gt;','"': '&quot;',"'": '&#39;','&': '&amp;'};

/**
 * Stringify Tree
 *
 * @return {String}
 */
TreePrototype.toString = function () {
	if (this.group > 0) {
		return extract(this).toString();
	}
	var tree = this;
	var group = tree.group;
	var type = tree.type;
	var flag = tree.flag;
	var tag = tree.tag;
	var children = tree.children;
	var body = '';
	var length = 0;
	var props;

	if (flag === 1) {
		return sanitize(children);
	}
	if (tree.props !== object && tree.props.innerHTML !== void 0) {
		body = tree.props.innerHTML;
	} else if ((length = children.length) > 0) {
		for (var i = 0; i < length; i++) {
			body += children[i].toString();
		}
	}
	return '<'+tag+stringify(tree)+'>'+ (empty[tag] !== 0 ? body+'</'+tag+'>' : '');
}

/**
 * Stringify Props
 *
 * @param  {Tree} tree
 * @return {String}
 */
function stringify (tree) {
	var props = tree.props;
	var body = '';
	var value;
	var val;

	if (props === object) {
		return body;
	}

	for (var name in props) {
		if (evt(name) === true) {
			continue;
		}
		switch (name) {
			case 'key': case 'children': case 'ref': case 'innerHTML': break;
			case 'style': {
				if (typeof(value = props[name]) === 'object') {
					name = '';
					for (var key in value) {
						val = value[key];
						if (key !== key.toLowerCase()) {
							key = key.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').replace(/^(ms|webkit|moz)/, '-$1').toLowerCase();
						}
						name += key + ':' + val + ';';
					}
					value = name;
				}
				body += ' style="'+sanitize(value)+'"';
				break;
			}
			case 'defaultValue': {
				if (props.value !== void 0) {
					break;
				}
				body += ' value="'+sanitize(props[name])+'"';
			}
			case 'className': name = 'class';
			default: {
				switch ((value = props[name])) {
					case false: case null: case void 0: continue;
					case true: body += ' '+name; continue;
				}
				body += ' '+name+'="'+sanitize(value)+'"';
			}
		}
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
