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
	var arr = [];

	for (var key in object) {
		var value = object[key];
		var prefixed = prefix !== void 0 ? prefix + '[' + key + ']' : key;

		// recursive serialize
		if (typeof value == 'object') {
			arr[arr.length] = serialize(value, prefixed);
		}
		// serialize
		else {
			arr[arr.length] = encodeURIComponent(prefixed) + '=' + encodeURIComponent(value);
		}
	}

	return arr.join('&');
}

