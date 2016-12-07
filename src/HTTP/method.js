/**
 * create request method
 * 
 * @param {string}
 * @param {function}
 */
function method (method) {
	return function (
		url, payload, enctype, withCredentials, initial, config, username, password
	) {
		// encode url
		var uri = encodeURI(url);

		// enctype syntax sugar
		switch (enctype) {
			case 'json': { enctype = 'application/json'; break; }
			case 'text': { enctype = 'text/plain'; break; }
			case 'file': { enctype = 'multipart/form-data'; break; }
			default:     { enctype = 'application/x-www-form-urlencoded'; }
		}

		// if has payload && GET pass payload as query string
		if (method === 'GET' && payload) {
			uri = uri + '?' + (typeof payload === 'object' ? serialize(payload) : payload);
		}

		// return promise-like stream
		return create(
			method, uri, payload, enctype, withCredentials, initial, config, username, password
		);
	}
}

