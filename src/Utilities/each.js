/**
 * for in proxy
 * 
 * @param  {Object}   subject
 * @param  {Function} callback
 */
function each (subject, callback) {
	for (var name in subject) {
		callback(subject[name], name, subject);
	}
}

