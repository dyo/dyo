/**
 * retrieve and format response
 * 
 * @param  {XMLHttpRequest} xhr
 * @param  {string}         responseType
 * @param  {function}       resolve
 * @param  {function}       reject
 * @return {(Node|string|Object)}
 */
function response (xhr, responseType, resolve, reject) {			
	var header = xhr.getResponseHeader('Content-Type');
	var status = xhr.status;
	var data = null; 
	var body;

	// text
	if (!xhr.responseType || xhr.responseType === 'text') {
		data = xhr.responseText;
	}
	// Node 
	else if (xhr.responseType === 'document') {
		data = responseXML;
	}
	// ?any
	else {
		data = response;
	}

	// response format
	if (responseType == null) {
		responseType = (header.indexOf(';') > -1 ? header.split(';')[0].split('/') : header.split('/'))[1];
	}

	// json
	if (responseType === 'json') {
		// sandbox JSON parsing
		body = sandbox(JSON.parse, reject, data);
	} 
	// Node
	else if (responseType === 'html' || responseType === 'document') {
		// parse html string
		body = (new DOMParser()).parseFromString(data, 'text/html');
	}
	// ?any
	else {
		body = data;
	}

	(!status || status >= 400) ? reject(xhr) : resolve(body);
}

