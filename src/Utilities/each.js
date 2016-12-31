/**
 * for in proxy
 * 
 * @param  {Object<string, any>} obj
 * @param  {function(any, string)} func
 */
function each (obj, func) {
	for (var name in obj) {
		func(obj[name], name);
	}
}

