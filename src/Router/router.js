/**
 * router
 * 
 * @param  {Object}        routes
 * @param  {string}        address 
 * @param  {string}        initialiser
 * @param  {(string|Node)} element
 * @param  {middleware}    middleware
 * @return {Object}
 */
function router (routes, address, initialiser, element, middleware) {
	if (typeof routes === 'function') {
		routes = routes();
	}

	if (typeof address === 'function') {
		address = address();
	}

	if (typeof address === 'object') {
		element     = address.mount,
		initialiser = address.init,
		middleware  = address.middleware,
		address     = address.root;
	}

	if (element !== void 0) {
		each(routes, function (component, uri) {
			if (middleware !== void 0) {
				routes[uri] = function (data) {
					middleware(component, data, element, uri);
				}
			} else {
				routes[uri] = function (data) {
					render(VComponent(component, data), element);
				}
			}
		});
	}

	return createRouter(routes, address, initialiser);
}

