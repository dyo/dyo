/**
 * router constructor
 * 
 * @param {Object<string, (function|Component)>} patterns
 * @param {string=}                              directory
 * @param {function=}                            initialiser
 * @param {function=}                            notFound
 */
function createRouter (patterns, directory, initialiser, notFound) {
	// listens for changes to the url
	function listen () {
		if (interval !== 0) {
			// clear the interval if it's already set
			clearInterval(interval);
			interval = 0;
		}

		// start listening for a change in the url
		interval = setInterval(function () {
			href = location.href;

			// current url does not equal the url of the browser
			if (href !== current) {
				// update the current and dispatch
				dispatch((current = href).replace(origin, ''));
			}
		}, 40);
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
		// the pattern would be / ([^\/]+) / ([^\/]+) / (?:.*)
		var pattern = uri.replace(regex, function () {
			// id => arguments: 'user', id, undefned
			var id = arguments[2];
			// if, not variable, else, capture variable
			return id != null ? (params[params.length] = id, '([^\/]+)') : '(?:.*)';
		});

		// assign a route item
		Object.defineProperty(routes, uri, {
			value: Object.create(null, {
				callback: { value: callback, },
				pattern:  { value: new RegExp(directory + pattern + '$'), },
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

		// if resolved flag is 0 and a notFound function is available
		if (resolved === 0 && notFound !== void 0) {
			notFound({url: current});
		}

		// reset resolved flag
		resolved = 0;
	}

	// find a match from the available routes
	function finder (route, uri, current) {
		var match = current.match(route.pattern);

		// we have a match
		if (match != null) {
			// create params object to pass to callback
			// i.e {user: 'simple', id: '1234'}
			var args = match.slice(1, match.length).reduce(function (prev, val, i) {
				// if this is the first value, create variables store
				if (prev === null) {
					prev = {url: current};
				}

				// name: value, i.e user: 'simple'
				// `vars` contains the keys for variables
				prev[route.params[i]] = val;

				return prev;

				// null --> first value
			}, null) || {uri: current};

			route.callback(args, uri);

			// register match
			resolved = 1;
		}
		else {
			// register not found
			resolved = 0;
		}
	}

	// middleware between event and route
	function link (to) {
		var func = typeof to === 'function';

		return function (e) {
			var target = e.currentTarget || e.target || this;
			var value = func ? to(target) : to;

			navigate(target[value] || (target.nodeName && target.getAttribute(value)) || value); 
		};
	}

	// navigate to a uri
	function navigate (uri) {
		if (typeof uri === 'string') {
			history.pushState(null, null, directory + uri);
		}
	}

	// resume listener
	function resume () {
		current = location.href;
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
	if (typeof directory === 'string' && directory.charCodeAt(directory.length - 1) === 47) {
		directory = directory.substring(0, directory.length - 1);
	}

	var regex = /([:*])(\w+)|([\*])/g;
	var history = window.history || objEmpty;
	var location = history.location || window.location;
	var origin = location.origin;
	var current = '';
	var href = '';
	var interval = 0;
	var resolved = 0;
	var routes = {};

	/** @public */
	var api = Object.defineProperty({
		navigate: navigate,
		back: history.back, 
		forward: history.forward, 
		link: link,
		resume: resume,
		pause: pause,
		destroy: destroy,
		set: set,
		resolve: resolve,
		routes: routes
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
		}
		else if (type === 'string') {
			// navigate to path
			navigate(initialiser);
		}
	}

	return api;
}

