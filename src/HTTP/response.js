/**
 * parse, format response
 * 
 * @param  {Object} xhr
 * @return {*} 
 */
function response (xhr, type) {			
	var body; 
	var type; 
	var data;
	var header = xhr.getResponseHeader('Content-Type');

	if (!xhr.responseType || xhr.responseType === 'text') {
        data = xhr.responseText;
    } else if (xhr.responseType === 'document') {
        data = xhr.responseXML;
    } else {
        data = xhr.response;
    }

	// get response format
	type = (
		header.indexOf(';') !== -1 ? 
		header.split(';')[0].split('/') : 
		header.split('/')
	)[1];

	switch (type) {
		case 'json': { body = JSON.parse(data); break; }
		case 'html': { body = (new DOMParser()).parseFromString(data, 'text/html'); break; }
		default    : { body = data; }
	}

	return body;
}

