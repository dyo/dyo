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

	if (middleware !== void 0) {
		each(routes, function (func, uri) {
			routes[uri] = function (data) { middleware(func, data, element); };
		});
	} else if (element !== void 0) {
		each(routes, function (component, uri) {
			routes[uri] = function (data) {
				render(VComponent(component, data), element, null, false);
			};
		});
	}

	return createRouter(routes, address, initialiser, notFound);
}

