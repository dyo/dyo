/**
 * router
 *
 * @public
 * 
 * @param  {Object<string, (function|Component)>} routes
 * @param  {string|Object<string, any>=}          address 
 * @param  {string=}                              initialiser
 * @param  {(string|Node)=}                       element
 * @param  {function=}                            middleware
 * @param  {function=}                            notFound
 * @return {Object}
 */
function router (routes, directory, initial, mount, middleware, notFound) {
	if (typeof directory === 'object') {
		mount = directory.mount;
		initial = directory.initial;
		middleware = directory.middleware;
		notFound = directory['404'];
		directory = directory.directory;
	}

	// functions
	if (middleware !== void 0) {
		for (var name in routes) {
			(function () {
				var func = routes[name];

				routes[name] = function (data) { 
					middleware(func, data, mount); 
				};
			})()
		}
	}
	// components
	else if (mount !== void 0) {
		for (var name in routes) {
			(function () {
				var component = routes[name];

				routes[name] = function (data) {	
					render(createComponentShape(component, data, null), mount, null, false);
				};
			})();
		}
	}

	return createRouter(routes, directory || '', initial, notFound);
}

