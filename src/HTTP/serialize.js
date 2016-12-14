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

	each(object, function (value, key) {
		var prefixValue = prefix !== void 0 ? prefix + '[' + key + ']' : key;

		// when the value is equal to an object 
		// we have somethinglike value = {name:'John', addr: {...}}
		// re-run param(addr) to serialize 'addr: {...}'
		arr[arr.length] = typeof value == 'object' ? 
								serialize(value, prefixValue) :
								encodeURIComponent(prefixValue) + '=' + encodeURIComponent(value);
	});

	return arr.join('&');
}

