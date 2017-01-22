/**
 * request shape
 * 
 * @param {string}           method
 * @param {string}           url
 * @param {(string|Object)=} payload
 * @param {string=}          enctype
 * @param {string=}          responseType
 */
function createRequestShape (method, url, payload, enctype, responseType) {
	return {
		method: method,
		url: url,
		payload: payload,
		enctype: enctype,
		responseType: responseType,
		withCredentials: null,
		headers: null,
		initial: null,
		config: null,
		username: null,
		password: null
	};
}

