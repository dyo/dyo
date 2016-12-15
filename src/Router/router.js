/**
 * router
 * 
 * @param  {Object<string, (function|Component)>} routes
 * @param  {string=}                              address 
 * @param  {string=}                              initialiser
 * @param  {(string|Node)=}                       element
 * @param  {function=}                            middleware
 * @param  {function=}                            notFound
 * @return {Object}
 */
function router (routes, address, initialiser, element, middleware, notFound) {
	if (typeof routes === 'function') {
		routes = routes();
	}

	if (typeof address === 'function') {
		address = address();
	}

	if (typeof address === 'object') {
		element     = address.mount;
		initialiser = address.initial;
		middleware  = address.middleware;
		notFound    = address['404'];
		address     = address.directory;
	}

	if (element !== void 0) {
		var callback;

		if (middleware !== void 0) {
			callback = function callback (data) { middleware(component, data, element); }
		} else {
			callback = function callback (data) { render(VComponent(component, data), element); }
		}

		each(routes, function (component, uri) {
			routes[uri] = callback;
		});
	}

	return createRouter(routes, address, initialiser, notFound);
}

