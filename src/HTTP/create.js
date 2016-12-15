/**
 * create http request
 * 
 * @param  {string}            method
 * @param  {string}            uri
 * @param  {(Object|string)=}  payload
 * @param  {string=}           enctype
 * @param  {string=}           responseType
 * @param  {boolean=}          withCredential
 * @param  {initial=}          initial
 * @param  {function=}         config
 * @param  {string=}           username
 * @param  {string=}           password
 * @return {function}
 */
function create (
	method, uri, payload, enctype, responseType, withCredentials, initial, headers, config, username, password
) {
	// return a a stream
	return stream(function (resolve, reject, stream) {
		// if XMLHttpRequest constructor absent, exit early
		if (window.XMLHttpRequest == null) {
			return;
		}

		// create xhr object
		var xhr = new window.XMLHttpRequest();

		// retrieve browser location 
		var location = window.location;

		// create anchor element
		var anchor = document.createElement('a');
		
		// plug uri as href to anchor element, 
		// to extract hostname, port, protocol properties
		anchor.href = uri;

		// check if cross origin request
		var isCrossOriginRequest = !(
			anchor.hostname   === location.hostname && 
			anchor.port       === location.port &&
			anchor.protocol   === location.protocol && 
			location.protocol !== 'file:'
		);

		// remove reference
		anchor = null;

		// open request
		xhr.open(method, uri, true, username, password);

		// on success resolve
		xhr.onload  = function () { resolve(response(this, responseType, reject)); };
		// on error reject
		xhr.onerror = function () { reject(this.statusText); };
		
		// cross origin request cookies
		isCrossOriginRequest && withCredentials && (xhr.withCredentials = true);

		// assign content type and payload
		if (method === 'POST') {
			xhr.setRequestHeader('Content-Type', enctype);

			if (enctype.indexOf('x-www-form-urlencoded') > -1) {
				payload = serialize(payload);
			} else if (enctype.indexOf('json') > -1) {
				payload = JSON.stringify(payload);
			}
		}

		if (headers != null) {
			each(headers, function (value, name) {
				xhr.setRequestHeader(name, value);
			});
		}

		// if, assign inital value of stream
		initial !== void 0 && resolve(initial);

		// config, expose underlying XMLHttpRequest object
		// allows us to save a reference to it and call abort when required
		config != null && typeof config === 'function' && config(xhr);

		// send request
		payload !== void 0 ? xhr.send(payload) : xhr.send();
	});
}

