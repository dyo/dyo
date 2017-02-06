/**
 * serialize + encode object
 * 
 * @example serialize({url:'http://.com'}) //=> 'url=http%3A%2F%2F.com'
 * 
 * @param  {Object} object   
 * @param  {string} prefix
 * @return {string}
 */
function serialize (object, prefix) {
	var array = [];

	for (var key in object) {
		var value = object[key];
		var prefixed = prefix !== void 0 ? prefix + '[' + key + ']' : key;

		// recursive serialize
		if (typeof value == 'object') {
			array[array.length] = serialize(value, prefixed);
		}
		// serialize
		else {
			array[array.length] = encodeURIComponent(prefixed) + '=' + encodeURIComponent(value);
		}
	}

	return array.join('&');
}

