/**
 * retrieve and format response
 * 
 * @param  {Object}   xhr
 * @param  {string}   responseType
 * @param  {function} reject
 * @return {*} 
 */
function response (xhr, responseType, reject) {			
	var data, header = xhr.getResponseHeader('Content-Type');

	if (!xhr.responseType || xhr.responseType === 'text') {
		data = xhr.responseText;
	} else if (xhr.responseType === 'document') {
		data = responseXML;
	} else {
		data = response;
	}

	// response format
	if (!responseType) {
		responseType = (header.indexOf(';') > -1 ? header.split(';')[0].split('/') : header.split('/'))[1];
	}

	var body;

	if (responseType === 'json') {
		body = sandbox(JSON.parse, reject, data);
	} else if (responseType === 'html' || responseType === 'document') {
		body = (new DOMParser()).parseFromString(data, 'text/html');
	} else {
		body = data;
	}

	return body;
}

