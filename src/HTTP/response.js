/**
 * retrieve and format response
 * 
 * @param  {XMLHttpRequest} xhr
 * @param  {string}         responseType
 * @param  {function}       reject
 * @return {(Node|string|Object)}
 */
function response (xhr, responseType, reject) {			
	var data   = null; 
	var header = xhr.getResponseHeader('Content-Type');

	if (!xhr.responseType || xhr.responseType === 'text') {
		data = xhr.responseText;
	} else if (xhr.responseType === 'document') {
		data = responseXML;
	} else {
		data = response;
	}

	// response format
	if (responseType == null) {
		responseType = (header.indexOf(';') > -1 ? header.split(';')[0].split('/') : header.split('/'))[1];
	}

	var body;

	if (responseType === 'json') {
		body = tryCatch(JSON.parse, reject, data);
	} else if (responseType === 'html' || responseType === 'document') {
		body = (new DOMParser()).parseFromString(data, 'text/html');
	} else {
		body = data;
	}

	return body;
}

