/**
 * ---------------------------------------------------------------------------------
 * 
 * router
 * 
 * ---------------------------------------------------------------------------------
 */


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

	if (element !== undefined) {
		each(routes, function (component, uri) {
			if (middleware !== undefined) {
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

	return Router(routes, address, initialiser);
}


/**
 * router constructor
 * 
 * @param {any[]}     routes
 * @param {string=}   address
 * @param {function=} initialiser
 */
function Router (routes, address, initialiser) {
	// listens for changes to the url
	function listen () {
		if (interval !== 0) {
			// clear the interval if it's already set
			clearInterval(interval);
		}

		// start listening for a change in the url
		interval = setInterval(function () {
			var current = window.location.pathname;

			// if our store of the current url does not 
			// equal the url of the browser, something has changed
			if (location !== current) {					
				// update the location
				location = current;

				// dispatch route change
				dispatch();
			}
		}, 50);
	}

	// register routes
	function register () {
		// assign routes
		each(routes, function (callback, uri) {
			// - params is where we store variable names
			// i.e in /:user/:id - user, id are variables
			var params = [];

			// uri is the url/RegExp that describes the uri match thus
			// given the following /:user/:id/*
			// the pattern will be / ([^\/]+) / ([^\/]+) / (?:.*)
			var pattern = uri.replace(regexp, function () {
				// id => 'user', '>>>id<<<', undefned
				var id = arguments[2];

				// if, not variable, else, capture variable
				return id != null ? (params[params.length] = id, '([^\/]+)') : '(?:.*)';
			});

			// assign a route item
			routes[uri] = [callback, new RegExp((address ? address + pattern : pattern) + '$'), params];
		}, null);
	}

	// called when the listener detects a route change
	function dispatch () {
		each(routes, function (route, uri) {
			var callback = route[0];
			var pattern  = route[1];
			var params   = route[2];
			var match    = location.match(pattern);

			// we have a match
			if (match != null) {
				// create params object to pass to callback
				// i.e {user: 'simple', id: '1234'}
				var data = match.slice(1, match.length);

				var args = data.reduce(function (previousValue, currentValue, index) {
						// if this is the first value, create variables store
						if (previousValue == null) {
							previousValue = {};
						}

						// name: value
						// i.e user: 'simple'
						// `vars` contains the keys for the variables
						previousValue[params[index]] = currentValue;

						return previousValue;

						// null --> first value
					}, null); 

				callback(args, uri);
			}
		});
	}

	// navigate to a uri
	function navigate (uri) {
		if (typeof uri === 'string') {
			history.pushState(null, null, address ? address + uri : uri);
		}
	}

	// middleware between event and route
	function link (to) {
		var func = typeof to === 'function';

		return function (e) {
			var target = e.currentTarget;
			var value  = func ? to.call(target, target) : to;

			navigate(target[value] || target.getAttribute(value) || value); 
		}
	}

	// normalize rootAddress format
	// i.e '/url/' -> '/url'
	if (typeof address === 'string' && address.substr(-1) === '/') {
		address = address.substr(0, address.length - 1);
	}

	var location = '';
	var interval = 0;
	var regexp   = /([:*])(\w+)|([\*])/g;
	
	var api = {
		nav:    navigate,
		go:     history.go, 
		back:   history.back, 
		foward: history.foward, 
		link:   link
	};


	// register routes, start listening for changes
	register();

	// listens only while in the browser enviroment
	if (document !== undefined) {
		listen();
	}

	// initialiser, if function pass api as args, else string, navigate to uri
	if (initialiser !== undefined) {
		var type = typeof initialiser;

		if (type === 'function') {
			// initialiser function
			initialiser(api);
		} else if (type === 'string') {
			// navigate to path
			navigate(initialiser);
		}
	}

	return api;
}