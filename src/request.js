/**
 * ---------------------------------------------------------------------------------
 * 
 * requests
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * http requests
 * 
 * @param  {string}  url
 * @param  {*}       payload 
 * @param  {string}  enctype 
 * @param  {boolean} withCredentials
 * @return {Object}
 */
function request () {
	/**
	 * serialize + encode object
	 * 
	 * @example serialize({url:'http://.com'}) //=> 'url=http%3A%2F%2F.com'
	 * 
	 * @param  {Object} object   
	 * @param  {Object} prefix
	 * @return {string}
	 */
	function serialize (object, prefix) {
		var arr = [];

		each(object, function (value, key) {
			var prefixValue = prefix !== undefined ? prefix + '[' + key + ']' : key;

			// when the value is equal to an object 
			// we have somethinglike value = {name:'John', addr: {...}}
			// re-run param(addr) to serialize 'addr: {...}'
			arr[arr.length] = typeof value == 'object' ? 
									serialize(value, prefixValue) :
									encodeURIComponent(prefixValue) + '=' + encodeURIComponent(value);
		});

		return arr.join('&');
	}

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

		if (!xhr.responseType || xhr.responseType === "text") {
	        data = xhr.responseText;
	    } else if (xhr.responseType === "document") {
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

	/**
	 * create http request
	 * 
	 * @param  {string}            method
	 * @param  {string}            uri
	 * @param  {(Object|string)=}  payload
	 * @param  {string=}           enctype
	 * @param  {boolean=}          withCredential
	 * @param  {initial=}          initial
	 * @param  {function=}         config
	 * @param  {string=}           username
	 * @param  {string=}           password
	 * @return {function}
	 */
	function create (
		method, uri, payload, enctype, withCredentials, initial, config, username, password
	) {
		// return a a stream
		return stream(function (resolve, reject, stream) {
			// if XMLHttpRequest constructor absent, exit early
			if (window.XMLHttpRequest === undefined) {
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

			// remove reference, for garbage collection
			anchor = null;

			// open request
			xhr.open(method, uri, true, username, password);

			// on success resolve
			xhr.onload  = function onload () { resolve(response(this)); };
			// on error reject
			xhr.onerror = function onerror () { reject(this.statusText); };
			
			// cross origin request cookies
			if (isCrossOriginRequest && withCredentials === true) {
				xhr.withCredentials = true;
			}

			// assign content type and payload
			if (method === 'POST' || method === 'PUT') {
				xhr.setRequestHeader('Content-Type', enctype);

				if (enctype.indexOf('x-www-form-urlencoded') > -1) {
					payload = serialize(payload);
				} else if (enctype.indexOf('json') > -1) {
					payload = JSON.stringify(payload);
				}
			}

			// if, assign inital value of stream
			if (initial !== undefined) {
				resolve(initial);
			}

			// if config, expose underlying XMLHttpRequest object
			// allows us to save a reference to it and call abort when required
			if (config !== undefined && typeof config !== 'function') {
				config(xhr);
			}

			// send request
			payload !== undefined ? xhr.send(payload) : xhr.send();
		});
	}


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

	/**
	 * request constructor
	 * 
	 * request({method: 'GET', url: '?'}) === request.get('?')
	 * 
	 * @param  {Object} subject
	 * @return {function}
	 */
	function Request (subject) {
		if (typeof subject === 'string') {
			return Request.get(subject);
		} else {
			return Request[(subject.method || 'GET').toLowerCase()](
				subject.url, 
				subject.payload || subject.data,
				subject.enctype, 
				subject.withCredentials,
				subject.initial,
				subject.config,
				subject.username, 
				subject.password
			);
		}
	}

	Request.get  = method('GET'),
	Request.post = method('POST');

	return Request;
}

