/**
 * for in proxy
 * 
 * @param  {Object}   obj
 * @param  {function} func
 */
function each (obj, func) {
	for (var name in obj) {
		func(obj[name], name);
	}
}

