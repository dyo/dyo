/**
 * router constructor
 * 
 * @param {Object<string, (function|Component)>} patterns
 * @param {string=}                              address
 * @param {function=}                            initialiser
 * @param {function=}                            notFound
 */
function createRouter (patterns, address, initialiser, notFound) {
	// listens for changes to the url
	function listen () {
		if (interval !== 0) {
			// clear the interval if it's already set
			clearInterval(interval);
			interval = 0;
		}

		// start listening for a change in the url
		interval = setInterval(function () {
			var pathname = location.pathname;

			// if our store of the current url does not 
			// equal the url of the browser, something has changed
			if (current !== pathname) {					
				// update the location and dispatch route change
				dispatch(current = pathname);
			}
		}, 50);
	}

	// register routes
	function register () {
		// assign routes
		for (var name in patterns) {
			set(name, patterns[name]);
		}
	}

	// assign a route
	function set (uri, callback) {
		// - params is where we store variable names
		// i.e in /:user/:id - user, id are variables
		var params = [];

		// uri is the url/RegExp that describes the uri match thus
		// given the following /:user/:id/*
		// the pattern will be / ([^\/]+) / ([^\/]+) / (?:.*)
		var pattern = uri.replace(regRoute, function () {
			// id => arguments: 'user', id, undefned
			var id = arguments[2];
			// if, not variable, else, capture variable
			return id != null ? (params[params.length] = id, '([^\/]+)') : '(?:.*)';
		});

		// assign a route item
		Object.defineProperty(routes, uri, {
			value: Object.create(null, {
				callback: { value: callback, },
				pattern:  { value: new RegExp((address ? address + pattern : pattern) + '$'), },
				params:   { value: params, }
			}),
			enumerable: true
		});
	}

	// called when the listener detects a route change
	function dispatch (current) {
		for (var name in routes) {
			finder(routes[name], name, current);
		}

		if (resolved === 0 && notFound !== void 0) {
			notFound({url: current});
		}

		resolved = 0;
	}

	// find a match from the available routes
	function finder (route, uri, current) {
		var callback = route.callback;
		var pattern  = route.pattern;
		var params   = route.params;
		var match    = current.match(pattern);

		// we have a match
		if (match != null) {
			// create params object to pass to callback
			// i.e {user: 'simple', id: '1234'}
			var data = match.slice(1, match.length);

			var args = data.reduce(function (previousValue, currentValue, index) {
				// if this is the first value, create variables store
				if (previousValue === null) {
					previousValue = {url: current};
				}

				// name: value, i.e user: 'simple'
				// `vars` contains the keys for variables
				previousValue[params[index]] = currentValue;

				return previousValue;

				// null --> first value
			}, null) || {uri: current};

			callback(args, uri);

			resolved = 1;
		} else {
			resolved = 0;
		}
	}

	// middleware between event and route
	function link (to) {
		var func = typeof to === 'function';

		return function (e) {
			var target = e.currentTarget || e.target || this;
			var value  = func ? to(target) : to;

			navigate(target[value] || (target.nodeName && target.getAttribute(value)) || value); 
		};
	}

	// navigate to a uri
	function navigate (uri) {
		if (typeof uri === 'string') {
			history.pushState(null, null, address ? address + uri : uri);
		}
	}

	// resume listener
	function resume () {
		current = location.pathname;
		listen();
	}

	// pause listerner
	function pause () {
		clearInterval(interval);
	}

	// stop listening and clear all routes 
	function destroy () {
		pause();
		routes = {};
	}

	// manually resolve a route
	function resolve (uri) {
		dispatch(uri);
	}

	// normalize rootAddress format
	// i.e '/url/' -> '/url', 47 === `/` character
	if (typeof address === 'string' && address.charCodeAt(address.length - 1) === 47) {
		address = address.substring(0, address.length - 1);
	}

	var history  = window.history || objEmpty;
	var location = history.location || window.location;
	var current  = '';
	var interval = 0;
	var resolved = 0;
	var routes   = {};

	var api      = Object.defineProperty({
		back:    history.back, 
		foward:  history.forward, 
		link:    link,
		resume:  resume,
		pause:   pause,
		destroy: destroy,
		set:     set,
		resolve: resolve,
		routes:  routes
	}, 'location', {
		get: function () { return current; },
		set: navigate
	});

	// register routes
	register();

	// state listening if browser enviroment
	if (browser) {
		listen();
	}

	// initialiser, if function pass api as args, else string, navigate to uri
	if (initialiser !== void 0) {
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

