/**
 * request constructor
 * 
 * request({method: 'GET', url: '?'}) === request.get('?')
 * 
 * @param  {Object} subject
 * @return {function}
 */
function request (subject) {
	if (typeof subject === 'string') {
		return request.get(subject);
	} else {
		return request[(subject.method || 'GET').toLowerCase()](
			subject.url, 
			subject.payload || subject.data,
			subject.enctype, 
			subject.responseType,
			subject.withCredentials,
			subject.initial,
			subject.config,
			subject.username, 
			subject.password
		);
	}
}

request.get  = method('GET'),
request.post = method('POST');

