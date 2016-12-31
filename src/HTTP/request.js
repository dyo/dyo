/**
 * request constructor
 *
 * @public
 * 
 * @example request({method: 'GET', url: '?'}) === request.get('?')
 * 
 * @param  {VRequest|Object<string, any>} options
 * @return {function} {then, catch, done, ...}
 */
function request (options) {
	var payload = options.payload;
	var method  = options.method = (options.method.toUpperCase() || 'GET');
	
	// encode url
	options.url = encodeURI(options.url);

	// enctype syntax sugar
	switch (options.enctype) {
		case 'json': options.enctype = 'application/json'; break;
		case 'text': options.enctype = 'text/plain'; break;
		case 'file': options.enctype = 'multipart/form-data'; break;
		default:     options.enctype = 'application/x-www-form-urlencoded';
	}

	// if has payload && GET pass payload as query string
	if (method === 'GET' && payload != null) {
		options.url += '?' + (typeof payload === 'object' ? serialize(payload) : payload);		
	}

	// returns a promise-like stream
	return http(options);
}

request.get = function (url, payload, enctype, responseType) {
	return request(VRequest('GET', url, payload, enctype, responseType));
};

request.post = function (url, payload, enctype, responseType) {
	return request(VRequest('POST', url, payload, enctype, responseType));
};

