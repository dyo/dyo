/**
 * Surl - a react like virtual dom library
 * @author Sultan Tarimo <https://github.com/sultantarimo>
 */
(function () {
	// strict mode, tell the runtime not to suppress my silent mistakes
	// globals, undefined variables etc.
	'use strict';

	// references for better minification
	// so instead of obj.constructor we would do obj[__constructor]
	// the minifier will be able to minify that to something like
	// o[c] while it can't do the same for the former
	var __namespace          = {
			math:  'http://www.w3.org/1998/Math/MathML',
			xlink: 'http://www.w3.org/1999/xlink',
			svg:   'http://www.w3.org/2000/svg'
		},
		__document                  = document,
		__window                    = window,
		__constructor               = 'constructor',
		__prototype                 = 'prototype',
		__length                    = 'length',
		__number                    = Number,
		__array                     = Array,
		__object                    = Object,
		__function                  = Function,
		__string                    = String,
		__date                      = Date,
		__XMLHttpRequest            = XMLHttpRequest,
		__Math                      = Math,
		__null                      = null,
		__false                     = false,
		__true                      = true,
		__undefined                 = void 0,
		__encodeURIComponent        = encodeURIComponent,
		__getInitialState           = 'getInitialState',
		__getDefaultProps           = 'getDefaultProps',
		__componentWillReceiveProps = 'componentWillReceiveProps',
		__componentDidMount         = 'componentDidMount',
		__componentWillMount        = 'componentWillMount',
		__componentWillUnmount      = 'componentWillUnmount',
		__componentWillUpdate       = 'componentWillUpdate',
		__componentDidUpdate        = 'componentDidUpdate';

	/**
	 * requestAnimationFrame Polyfill
	 */
	(function () {
		// references
		var requestAnimationFrame = 'requestAnimationFrame',
			cancelAnimationFrame  = 'cancelAnimationFrame',
			vendors               = ['ms', 'moz', 'webkit'],
			vendorsLength         = vendors[__length],
			// greedy save a few bytes on declaring RequestAnimationFrame variations multple times
			animationFrame        = 'AnimationFrame',
			lastTime              = 0;

		// default to vendors if the standard version is missing
		for (var i = 0; i < vendorsLength && !__window[requestAnimationFrame]; ++i) {
			__window[requestAnimationFrame] = __window[vendors[i]+'Request'+animationFrame],
			__window[cancelAnimationFrame]  = __window[vendors[i]+'Cancel'+animationFrame] ||
											  __window[vendors[i]+'CancelRequest'+animationFrame]
		}

		// requestAnimationFrame doesn't exist, polyfill it
		if (!__window[requestAnimationFrame]) {
			__window[requestAnimationFrame] = function (callback) {
				var currTime   = new __date().getTime(),
					timeToCall = __Math.max(0, 16 - (currTime - lastTime)),

					id         = __window.setTimeout(function () { 
									callback(currTime + timeToCall)
								}, timeToCall);

					lastTime   = currTime + timeToCall;

				return id
			}
		}

		// cancelAnimationFrame doesn't exist, polyfill it
		if (!__window[cancelAnimationFrame]) {
			__window[cancelAnimationFrame] = function (id) {
				clearTimeout(id)
			}
		}
	}());


	/**
	 * check Object type
	 * @param  {Any}  obj  - object to check for type
	 * @param  {Any}  type - type to check for
	 * @return {Boolean}   - true/false
	 */
	function isType (obj, type) {
		// only check if obj is not a falsey value
		if (!type) {
			if (obj) {
				return true
			}
			else {
				return false
			}
		}
		// check object type
		else {
			// onj has a constructor
			if (obj !== __undefined && obj !== __null) {
				return obj[__constructor] === type
			}
			// doesn't, probably null or undefined 
			// that don't have constructors methods, return false
			else {
				return __false
			}
		}
	}

	/**
	 * 'forEach' shortcut
	 * @param  {Array|Object} a 
	 * @param  {Function}     fn
	 * @return {Array|Object}
	 */
	function each (arr, fn) {
		// index {Number}
		var index;

		// Handle arrays, and array-like Objects, 
		// array-like objects (have prop .length that is a number) and numbers for keys [0]
		if (isType(arr, __array) || arr[__length] && isType(arr[__length], __number) && arr[0]) {
			// length {Number}
			var length = arr[__length];
				index = 0;

			for (; index < length; ++index) {
				// break if fn() returns false
				if (fn.call(arr[index], arr[index], index, arr) === __false) {
					return arr
				}
			}
		}
		// Handle objects 
		else {
			for (index in arr) {
				// break if fn() returns false
				if (fn.call(arr[index], arr[index], index, arr) === __false) {
					return arr
				}
			}
		}

		return arr
	}

	/**
	 * requestAnimationFrame helper
	 * @param  {Function} fn  - function to run on each frame update
	 * @param  {Number}   fps - frames per second
	 * @param  {Object}   raf - object to store raf reference
	 */
	function raf (fn, fps, raf) {
		var then = new __date().getTime();
	
		// use custom fps if supplied, otherwise fallback to 60fps
		fps = fps || 60;
		var interval = 1000 / fps;
	
		return (function loop (time) {
			// assign reference to raf
			raf.id    = requestAnimationFrame(loop)

			var now   = new __date().getTime(),
				delta = now - then;
	
			if (delta > interval) {
				then = now - (delta % interval);
				fn(time)
			}
		}(0))
	}

	/**
	 * serialize + encode object
	 * @param  {Object}  obj    - `object to serialize`
	 * @param  {Object}  prefix
	 * @return {String}   serialized object
	 * @example
	 * // returns 'url=http%3A%2F%2F.com'
	 * param({url:'http://.com'})
	 */
	function param (obj, prefix) {
		var arr = [];

		for (var key in obj) {
		    var __prefix = prefix ? prefix + '[' + key + ']' : key,
		    	value    = obj[key];

		    // when the value is equal to an object that means that we have something like
		    // data = {name:'John', addr: {...}}
		    // so we re-run param on addr to serialize 'addr: {...}'
		    arr.push(typeof value == 'object' ? 
		    	param(value, __prefix) :
		    	__encodeURIComponent(__prefix) + '=' + __encodeURIComponent(value));
		}

		return arr.join('&');
	}
	
	/**
	 * ajax helper
	 * @param  {Object}   settings `ajax settings object`
	 * @param  {Function} callback `function to run onload`
	 * @example
	 * // returns xhr Object
	 * ajax({url, method, data}, fn(res, err) => {})
	 */
	function ajax (settings, callback) {
		var xhr      = new __XMLHttpRequest(),
			location = __window.location,
			url      = settings.url,
			callback = settings.callback,
			method   = settings.method,
			data     = settings.data || {};
		// create anchor element to extract usefull information
		var a        = __document.createElement('a');
			a.href   = url;
	
		// check if is this a cross origin request check
		var CORS = !(
			a.hostname        === location.hostname &&
			a.port            === location.port     &&
			a.protocol        === location.protocol &&
			location.protocol !== 'file:'
		);
			// destroy created element
			a = __null;
		
		// open request
		xhr.open(method, url, __true);
		
		// assign on error callback
		xhr.onerror = function () {
			callback(this, __true)
		}
		
		// assign on load callback
		xhr.onload = function () {
			// is callback specified?
			if (callback) {
				var params,
					response,
					responseText = xhr.responseText;
				
				// success
				if (this.status >= 200 && this.status < 400) {
					// get response header
					var resHeader = xhr.getResponseHeader("content-type"),
						resType;

					// formate response header
					if (resHeader.indexOf(';') !== -1) {
						resType = resHeader.split(';');
						resType = resType[0].split('/')
					}
					else {
						resType = resHeader.split('/')
					}

					// extract response type 'html/json/text'
					resType = resType[1];

					// json, parse json
					if (resType === 'json') {
						response = JSON.parse(responseText)
					}
					// html, create dom
					else if (resType === 'html') {
						response = (new DOMParser()).parseFromString(responseText, "text/html")
					}
					// text, leave as is.
					else {
						response = responseText
					}
					
					params = [response, __false]
				}
				// failed
				else {
					params = [this, __true]
				}
				
				// (response{String|Object|Node}, error{Boolean})
				callback(params[0], params[1])
			}
		}
		
		// set for this is a cross origin request
		if (CORS) {
			xhr.withCredentials = __true
		}
		
		// config non GET requests
		if (method !== 'GET') {
			// set the type of the data sent to either text/json
			xhr.setRequestHeader('Content-Type', isType(data, __object) ? 'application/json' : 'text/plain')
		}
		
		// serialize settings for POST request
		if (method === 'POST') {
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			// i.e for {name: 'Foo'} Request Payload will be name=Foo
			xhr.send(param(data))
		}
		// non POST request 
		else {
			xhr.send()
		}
	
		return xhr
	}


	/* --------------------------------------------------------------
	 * 
	 * Core
	 * 
	 * -------------------------------------------------------------- */


	/**
	 * surl
	 * @param  {Element?} mount - optional parent element
	 * @return {surl}           - {settings, parent, router, vdom}
	 */
	var surl = function (mount) {
		// we are going to be doing this alot when we use this alot
		// it allows the minified to then convert all self to shorter alternatives
		// since you can't minify 'this' or Fn.bind
		var self = this;

		// element specified on instantiation
		// set mount element
		if (mount) {
			self.mount(mount)
		}

		// default to auto:false settings
		// auto:true settings activates a constant render diff
		// the default is to run a render diff on when this.setState()
		// is invoked
		self.settings = {
			auto: __false 
		}
	}

	surl[__prototype] = {
		Router: {
				// history back
				back: function () {
					history.back()
				},
				// history foward
				foward: function () {
					history.foward()
				},
				// history go
				go: function (index) {
					history.go(index)
				},
				// kills the rAf animation loop and clears the routes
				destroy: function () {
					this.routes = {};
					cancelAnimationFrame(this.raf.id);
				},
				// navigate to a view
				nav: function (url) {
					var root = this.settings.root;
						url  = root ? root + url : url;

					history.pushState(__null, __null, url);
				},
				// configure defualts
				config: function (obj) {
					var self = this;

					// add settings object if it doesn't exist
					if (!self.settings) {
						self.settings = {}
					}

					each(obj, function(value, name) {
						self.settings[name] = value
					})
				},
				// start listening for url changes
				listen: function () {
					var self      = this;
						self.url  = __null;
						self.raf  = {id: 0};

					// start listening for a a change in the url
					raf(function () {
						var url = __window.location.pathname;

						if (self.url !== url) {
							self.url = url;
							self.changed()
						}
					}, 60, self.raf)
				},
				// register routes
				on: function (args) {
					var self = this,
						routes;

					// create routes object if it doesn't exist
					if (!self.routes) {
						self.routes = {}
					}

					// start listening for route changes
					if (!self.raf) {
						self.listen()
					}

					// normalize args for ({obj}) and (url, callback) styles
					if (!isType(args, __object)) {
						var args   = arguments;
							routes = {};
							routes[args[0]] = args[1];
					}
					else {
						routes = args;
					}

					// assign routes
					each(routes, function (value, name) {
						var root = self.settings.root,
							variables = [],
							regex = /([:*])(\w+)|([\*])/g,
							// given the following /:user/:id/*
							pattern = name.replace(regex, function () {
										var args = arguments,
											id   = args[2];
											// 'user', 'id', undefned

										// if not a variable 
										if (!id) {
											return '(?:.*)'
										}
										// capture
										else {
											variables.push(id);
											return '([^\/]+)'
										}
									});

						self.routes[name] = {
							callback:  value,
							pattern:   root ? root + pattern : pattern,
							variables: variables
						}
					})
				},
				changed: function () {
					// references
					var self   = this,
						url    = self.url,
						routes = self.routes;

					each(routes, function (val) {
						var callback  = val.callback,
							pattern   = val.pattern,
							variables = val.variables,
							match;

						// exec pattern on url
						match = url.match(new RegExp(pattern));

						// we have a match
						if (match) {
							// create params object to pass to callback
							// i.e {user: "simple", id: "1234"}
							var args = match
								// remove the first(url) value in the array
								.slice(1, match[__length])
								.reduce(function (args, val, i) {
									if (!args) {
										args = {}
									}
									// var name: value
									// i.e user: 'simple'
									args[variables[i]] = val;
									return args
								}, __null);

							// callback is a function, exec
							if (isType(callback, __function)) {
								// component function
								__window.surl.Render(callback, __undefined, args)
							}
							// can't process
							else {
								throw 'could not find render method'
							}
						}
					})
				}
		},

		/**
		 * Virtual Dom
		 * @param  {Element}  a - parent element
		 * @param  {Function} b - render function
		 * @return {Object}     - vdom object
		 */
		DOM: (function () {
			// events
			function isEventProp (name) {
				// checks if the first two characters are on
				return name.substring(0,2) === 'on'
			}
		
			function extractEventName (name) {
				// removes the first two characters and converts to lowercase
				return name.substring(2, name[__length]).toLowerCase()
			}
		
			function addEventListeners (target, props) {
				for (var name in props) {
					if (isEventProp(name)) {
						// callback
						var callback = props[name];
		
						if (callback) {
							target.addEventListener(extractEventName(name), callback, __false)
						}
					}
				}
			}
		
			// assign/update/remove props
			function prop (target, name, value, op) {
				if (isEventProp(name) || name === 'ref') {
					return
				}

				// remove / add attribute reference
				var attr = (op === -1 ? 'remove' : 'set') + 'Attribute';
			
				// set xlink:href attr
				if (name === 'xlink:href') {
					return target.setAttributeNS(__namespace['xlink'], 'href', value)
				}
				// xmlns:xlink="http://www.w3.org/1999/xlink"
				// but "http://www.w3.org/1999/xlink" is not a valid namespace
				// for setAttributeNS()
				else if (name === 'xmlns:xlink') {
					return
				}

				// if the target has an attr as a property, 
				// change that aswell
				if (
					target[name]        !== __undefined && 
					target.namespaceURI !== __namespace['svg']
				) {
					target[name] = value
				}
				// don't set namespace attrs and properties that
				// can be set via target[name]
				else if (
					value !== __namespace['svg'] && 
					value !== __namespace['math']
				) {
					if (op === -1) {
						target[attr](name)
					}
					else {
						target[attr](name, value)
					}
				}
			}

			function didElementPropChange (name, newVal, oldVal) {
				var remove  = newVal === __undefined || newVal === __null,
					// (newVal !== oldVal && !isEventProp(name))
					// says only diff this if it's not an event i.e onClick...
					add     = oldVal === __undefined || oldVal === __null || (newVal !== oldVal && !isEventProp(name));

				// return how a prop has changed
				if (remove) {
					return -1
				}
				else if (add) {
					return +1
				}
			}
			
			function updateElementProps (target, newProps, oldProps, newNode) {
				var changes  = [];
					oldProps = oldProps !== __undefined ? oldProps : {};

				// merge old and new props
				var props = {};
				for (var name in newProps) { props[name] = newProps[name] }
				for (var name in oldProps) { props[name] = oldProps[name] }
			
				// compare if props have been added/delete/updated
				// if name not in newProp[name] : deleted
				// if name not in oldProp[name] : added
				// if name in oldProp !== name in newProp : updated
				for (var name in props) {
					var oldVal = oldProps[name],
						newVal = newProps[name],
					// returns true/false if the prop has changed from it's prev value
						change = didElementPropChange(name, newVal, oldVal),
						val    = change === -1 ? oldVal : newVal;

					if (change) {
						// we can then add this to the changes arr
						// that we can check later to see if any props have changed
						changes.push({
							target: target, 
							name:   name, 
							val:    val, 
							change: change
						})
					}
				}

				// console.log(changes.length, changes, oldProps, newProps)

				// if there are any changes, 
				// register that the component has updated
				if (changes[__length]) {
					// before component is updated
					if (newNode[__componentWillUpdate]) {
						var cmp = newNode[__componentWillUpdate].getCmp();
						newNode[__componentWillUpdate](cmp.props, cmp.state)
					}

					// update all components changed props
					each(changes, function (obj) {
						// add/remove prop
						prop(obj.target, obj.name, obj.val, obj.change)
					});

					// after component is updated
					if (newNode[__componentDidUpdate]) {
						var cmp = newNode[__componentDidUpdate].getCmp();
						newNode[__componentDidUpdate](cmp.props, cmp.state)
					}
				}
			}
			
			// initial creation of props, 
			// no checks, just set
			function setElementProps (target, props) {
				for (var name in props) {
					
					prop(target, name, props[name], +1)
				}
			}
		
			// create element
			function createElement (node, render) {
				// handle text nodes
				if (isType(node, __string)) {
					return __document.createTextNode(node)
				}
				// trusted text content
				else if (node.trust && node.$) {
					var div  = __document.createElement('div'),
						frag = __document.createDocumentFragment();

					div.innerHTML = node.content;
					var nodes     = __array[__prototype].slice.call(div.childNodes);

					each(nodes, function (value) {
						frag.appendChild(value)
					});

					return frag
				}

				var el;

				// not a text node 
				// check if it is namespaced
				if (node.props && node.props.xmlns) {
					el = __document.createElementNS(node.props.xmlns, node.type)
				}
				else {
					el = __document.createElement(node.type)
				}
				
				// diff and update/add/remove props
				setElementProps(el, node.props);
				// add events if any
				addEventListeners(el, node.props);
				
				// only map children arrays
				if (isType(node.children, __array)) {
					each(node.children, function (child) {
						el.appendChild(createElement(child, render))
					})
				}

				// add refs on the initial mount
				if (isType(render, __function)) {
					var props = node.props,
						ref   = props ? props.ref : __undefined;

					// component has a ref add to parent component
					if (ref) {
						var cmp      = render(__undefined, __undefined, true);
							cmp.refs = {};

						if (isType(ref, __function)) {
							ref(el)
						}
						else if (isType(ref, __string)) {
							cmp.refs[ref] = el
						}
					}
				}
		
				return el
			}
		
			// diffing two nodes
			function nodeChanged (node1, node2) {
				// diff object type
				var objectChanged      = node1[__constructor] !== node2[__constructor],
				// diff text content
					textContentChanged = isType(node1, __string) && node1 !== node2,
				// diff dom type
					elementTypeChanged = node1.type !== node2.type;
		
				return  objectChanged      || 
						textContentChanged || 
						elementTypeChanged
			}
			
			// validate
			function validateNode (a) {
				// converts 0 | false to strings
				if (a !== __undefined && (a === __null || a === 0 || a === __false)) {
					a = a + ''
				}

				return a
			}
		
			// diff
			function diff (parent, newNode, oldNode, index, render) {
				index   = index || 0,
				oldNode = validateNode(oldNode),
				newNode = validateNode(newNode);
		
				// adding to the dom
				if (oldNode === __undefined) {
					parent.appendChild(createElement(newNode, render));

					// after mounting component to dom
					// we run componentWillMount on once in surl:render before
					// before mounting the parent component to the dom
					// there difference between this and componentWillMount
					// is that componentWillMount will only run on parent components
					// whil componentDidMount will run on all components
					if (newNode[__componentDidMount]) {
						newNode[__componentDidMount]()
					}
				} 
				// removing from the dom
				else if (newNode === __undefined) {
					var node = parent.childNodes[index];

					// send to the end of the event queue
					// ensures the dom is always up to date
					// before we run removeChild
					setTimeout(function () {
						parent.removeChild(node);

						// after unmounting component from dom
						if (oldNode[__componentWillUnmount]) {
							oldNode[__componentWillUnmount]()
						}
					}, 0)
				}
				// replacing a node
				else if (nodeChanged(newNode, oldNode)) {
					// before component is updated
					if (newNode[__componentWillUpdate]) {
						var cmp = newNode[__componentDidUpdate].getCmp();
						newNode[__componentWillUpdate](cmp.props, cmp.state)
					}
					parent.replaceChild(createElement(newNode), parent.childNodes[index])
					// after component is updated
					if (newNode[__componentDidUpdate]) {
						var cmp = newNode[__componentDidUpdate].getCmp();
						newNode[__componentDidUpdate](cmp.props, cmp.state)
					}
				}
				// the lookup loop
				else if (newNode.type) {
					// diff, update props
					updateElementProps(parent.childNodes[index], newNode.props, oldNode.props, newNode);
					
					// loop through all children
					var newLength = newNode.children[__length],
						oldLength = oldNode.children[__length];
					
					for (var i = 0; i < newLength || i < oldLength; i++) {
						diff(parent.childNodes[index], newNode.children[i], oldNode.children[i], i, render)
					}
				}
			}

			// vdom public interface
			function DOM (parent, render) {
				// root reference
				this.mount = parent,
				// raf
				this.raf = __null,
				// local copy of cmp
				this.render = render
			}
			DOM[__prototype] = {
				// refresh/update dom
				update: function () {
					// get latest change
					var newNode = this.render(),
						// get old copy
						oldNode = this.old;

					diff(this.mount, newNode, oldNode, __undefined, this.render);
			
					// update old node
					this.old = newNode
				},
				// init mount to dom
				init: function () {
					// local copy of static hyperscript refence
					this.old = this.render(),
					this.new = this.old;
					// initial mount
					diff(this.mount, this.old, __undefined, __undefined, this.render)
				},
				// activate requestAnimationframe loop
				auto: function (start) {
					var self = this;

					// start
					if (start) {
						self.raf = {
							id: 1
						};

						// requestAnimationFrame at 60 fps
						raf(function () {
							self.update()
						}, 60, self.raf)
					}
					// stop
					else {
						cancelAnimationFrame(self.raf.id)
					}
				}
			}
		
			return DOM
		}()),

		/**
		 * make ajax requests
		 * @return {Object} xhr object
		 */
		Req: function Req () {
			var args     = arguments,
				settings = {method: 'GET'};

			// get and assign method, url and callback
			// from arguments based on type
			each(args, function (val) {
				// objects are data
				if (isType(val, __object)) {
					settings.data = val
				}
				// functions are callbacks
				else if (isType(val, __function)) {
					settings.callback = val
				}
				// strings are url/method
				else if (isType(val, __string)) {
					var type = val.toUpperCase();

					// methods
					if (type === 'POST' || type === 'GET') {
						settings.method = type
					}
					// url
					else {
						settings.url = val
					}  
				}
			});
			
			// process
			ajax(settings)
		},

		/**
		 * set mount to element
		 * @param  {Selector|Element} element - the element to mount to
		 */
		Mount: function Mount (element) {
			var self = this;

			// can't use document, use body instead
			if (element === __document) {
				element = element.body
			}
			// query selector if string
			else if (isType(element, __string)) {
				element = __document.querySelector(element)
			}

			// assign mount if element
			if (element && element.nodeType) {
				self.parent = element
			}
			// for references sake
			// incase you want to see all the properties
			// of an instance
			else {
				self.parent = __undefined
			}
		},

		/**
		 * initialize/mount
		 * @param {String} id - base component to mount to dom
		 */
		Render: function Render (cmp, element, params) {
			var self = this,
				params;

			// add parent element
			if (element) {
				// string? query element
				if (isType(element, __string)) {
					self.parent = __document.querySelector(element)
				}
				// element? add
				else if (element.nodeType) {
					self.parent = element
				}
			}

			// has parent to mount to
			if (self.parent) {
				// clear dom
				self.parent.innerHTML = '';

				// probably a plain hyperscript object
				// create class with render fn that returns it
				if (isType(cmp, __object)) {
					// hyperscript object
					var hs = cmp;
					// create component
						cmp = self.Component({render: function () { return hs } });
				}

				var cmpObj = cmp(__undefined, __undefined, true);

				// before mounting to dom, run once if set
				if (cmpObj[__componentWillMount]) {
					cmpObj[__componentWillMount](params)
				}

				// activate vdom
				self.virtual = new self.DOM(self.parent, cmp);
				self.virtual.init();

				// after mounting to dom, run once if set
				// if (cmpObj[__componentDidMount]) {
				// 	cmpObj[__componentDidMount]()
				// }

				// activate loop, if settings.auto = true
				if (self.settings.auto) {
					self.virtual.auto(__true)
				}
			}
			// can't find parent to mount to
			else {
				throw 'element to mount does not exist'
			}
		},

		/**
		 * create a component class
		 * @param  {Object} component - component object
		 * @return {Object}           - component
		 */
		Component: function Component (args) {
			var that = this;

			// add props, state namespace
			args.props = args.props || {}
			args.state = args.state || {}

			// create component
			var cmpClass = function () {
				var self = this;
				// add props to component
				each(args, function (value, name) {
					// bind the component scope to all methods
					if (isType(value, __function)) {
						value = value.bind(self)
					}

					// assign property/method
					self[name] = value
				})
			}

			// add setState and setProps methods to prototype
			each(['Props', 'State'], function (method) {
				// state/props
				var type = method.toLowerCase();

				// cmpClass.prototype.setState/setProps
				cmpClass[__prototype]['set'+method] = function (obj, update) {
					var self = this;

					// the obj passed in setState({obj}) / setProps({obj})
					if (obj) {
						// obj is a function that returns the setState({obj})
						if (isType(obj, __function)) {
							obj = obj(self.state, self.props)
						}

						each(obj, function (value, name) {
							self[type][name] = value
						});

						// only trigger render for setState() if settings.auto = false (the default)
						if (type === 'state' && !update && !that.settings.auto && that.virtual) {
							that.virtual.update()
						}
					}
				}
			});

			// create component object
			var cmpObj = new cmpClass;

			// get and set initial state
			if (cmpObj[__getInitialState]) {
				cmpObj.setState(cmpObj[__getInitialState](), __false)
			}
			// get and set default props
			if (cmpObj[__getDefaultProps]) {
				cmpObj.setProps(cmpObj[__getDefaultProps]())
			}

			// create components render returned hyperscript object
			function Element (obj) {
				this.type     = obj.type,
				this.props    = obj.props,
				this.children = obj.children,
				this.$     = true;
			}
			// add lifecycle methods to render
			each(cmpObj, function (value, name) {
				if (
					name === __componentWillMount        || 
					name === __componentWillUnmount      || 
					name === __componentWillReceiveProps || 
					name === __componentWillUpdate       || 
					name === __componentDidMount         ||
					name === __componentDidUpdate
				) {
					value.getCmp = function () {
						return cmpObj
					};
					Element[__prototype][name] = value
				}
			});
			// re add default object constructor
			Element[__prototype][__constructor] = __object;

			cmpObj.render = function () {
				return new Element(this())
			}.bind(cmpObj.render);

			// create component returned function
			var cmpFn = function (props, children, getCmpObj) {
				// set children
				// specified by parent cmp, i.e Foo(null, 'Text')
				if (children) {
					cmpObj.setProps({children: children})   
				}
				// set props 
				// specified by parent cmp, i.e Foo({prop: 'Value'})
				if (props) {
					cmpObj.setProps(props)
				}

				// componentWillReceiveProps
				// check if props or children are passed to component
				// we include children because they are also one type of a property
				// also check if componentWillReceiveProps() function is declared
				if ((props || children) && cmpObj[__componentWillReceiveProps]) {
					// if there both children and props are set
					if (props && children) {
						props.children = children
					}
					// just children set
					else if (!props && children) {
						props = {},
						props.children = children
					}
					console.log(props)
					// defaults to just props set
					cmpObj[__componentWillReceiveProps](props);
				}

				if (getCmpObj) {
					// return component object
					return cmpObj
				}
				else {
					// return hyperscript
					return cmpObj.render()
				}
			}

			return cmpFn
		},

		Element: (function () {
			/**
			 * hyperscript tagger
			 * @param  {Object} a - object with opt props key
			 * @param  {Object} b - tag
			 * @return {[Object]} - {props, type}
			 * @example
			 * // return {type: 'input', props: {id: 'id', type: 'checkbox'}}
			 * tag('inpu#id[type=checkbox]')
			 */
			function tag (obj) {
				var classes = [], 
					match,
					parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g,

					// copy obj's props to abstract props and type
					// incase obj.props is empty create new obj
					// otherwise just add to already available object
					// we will add this back to obj.props later
					props = !obj.props ? {} : obj.props,

					// since we use type in a while loop
					// we will be updating obj.type directly
					type = obj.type;

					// set default type to a div
					obj.type = 'div';

				// execute the regex and loop through the results
				while ((match = parser.exec(type))) {
					// no custom prop match
					if (match[1] === '' && match[2]) {
						obj.type = match[2]
					}
					// matches id's - #id
					else if (match[1] === '#') {
						props.id = match[2]
					} 
					// matches classes - div.classname
					else if (match[1] === '.') {
						classes.push(match[2])
					} 
					// matches - [attr=value]
					else if (match[3][0] === '[') {
						var attr = match[6];

						// make sure we have a non null|undefined|false value
						if (attr) {
							// remove the '[]'
							attr = attr.replace(/\\(["'])/g, '$1')
						}
						// if attr value is an empty string assign true
						props[match[4]] = attr || __true
					}
				}

				// add classes to obj.props if we have any
				if (classes[__length] > 0) {
					props.class = classes.join(' ')
				}

				// as promised, update props
				obj.props = props;
				
				// done
				return obj
			}

			/**
			 * hyperscript set children
			 * @param  {Any} a
			 * @return {String|Array|Object}
			 */
			function set (child, obj) {
				// add obj.prop to children if they are none TextNodes
				if (isType(child, __object) && obj.props.xmlns) {
					child.props.xmlns = obj.props.xmlns
				}

				if (
					!(
						isType(child, __object) || 
						isType(child, __string) || 
						isType(child, __array)
					)
				) {
					child = child + '';

					// convert the null, and undefined strings to empty strings
					// we don't convert false since that could 
					// be a valid value returned to the client
					if (child === 'null' || child === 'undefined') {
						child = ''
					}
				}
				
				return child
			}

			/**
			 * create virtual element : h()
			 * @param  {String} type  - Element, i.e: div
			 * @param  {Object} props - optional properties
			 * @return {Object}       - {type, props, children}
			 * @example
			 * h('div', {class: 'close'}, 'Text Content')
			 * h('div', null, h('h1', 'Text'));
			 */
			function Element (type, props) {
				var args   = arguments,
					length = args[__length],
					key    = 2,
					child;

				// no props specified default 2nd arg to children
				// is an hyperscript object or not an object (null,undefined,string,array,bool)
				if ((props && props.$) || !isType(props, __object)) {
					key   = 1,
					props = {}
				}
				// insure props is always an object
				else if (props === __null || props === __undefined || !isType(props, __object)) {
					props = {}
				}

				// declare hyperscript object
				var obj = {type: type, props: props, children: [], $: __true};

				// check if the type is a special case i.e [type] | div.class | #id
				// and alter the hyperscript
				if (
					type.indexOf('[') !== -1 ||
					type.indexOf('#') !== -1 || 
					type.indexOf('.') !== -1
				) {
					obj = tag(obj)
				}

				// auto set namespace for svg and math elements
				// we will then check when setting it's children
				// if the parent has a namespace we will set that
				// to the children as well, if you set the
				// xmlns prop we default to that instead of the 
				// svg and math presets
				if (obj.type === 'svg' || obj.type === 'math') {
					// only add the namespace if it's not already set
					if (!obj.props.xmlns) {
						obj.props.xmlns = __namespace[obj.type]
					}
				}

				// construct children
				for (var i = key; i < length; i++) {
					// reference to current layer
					child = args[i];
			
					// if the child is an array go deeper
					// and set the 'arrays children' as children
					if (isType(child, __array)) {
						for (var k = 0; k < child[__length]; k++) {
							obj.children[(i-key) + k] = set(child[k], obj)
						}
					}
					// deep enough, add this child to children
					else {
						obj.children[i - key] = set(child, obj)
					}
				}

				return obj
			}

			return Element
		}())
	}

	/* --------------------------------------------------------------
	 * 
	 * Helpers
	 *
	 * can be replaced/removed, if not needed
	 * 
	 * -------------------------------------------------------------- */


	/**
	 * two-way data binding, not to be confused with Function.bind
	 * @param  {String} prop - the property/attr to look for in the element
	 * @param  {Object} obj  - the object to update
	 * @param  {String} key  - the key in the object to update
	 */
	function bind (prop, cmp, key) {
		// the idea is that when you attach a function to an event,
		// i.e el.addEventListener('eventName', fn)
		// when that event is dispatched the function will execute
		// making the this context of this function the element 
		// that the event was attached to
		// we can then extract the prop, and run the setter(setState/setProps)
		// with the object {[key]: this[prop]}
		// to bind a state/prop to an element
		return function () {
			// assign element
			var el  = this,
				// get key from element
				// either the prop is a property of the element object
				// or an attribute
				value = (prop in el) ? el[prop] : el.getAttribute(prop);

				// just if(value) doesn't work if the value is false
				// and some prop values can be false
				// null and undefined = prop/attr doesn't exist
				if (value !== __undefined && value !== __null) {
					// round about way to do obj = {[key]: value}
					var obj      = {};
						obj[key] = value;

					// run the components setState
					cmp.setState(obj);
				}
		}
	}

	/**
	 * flag as a trusted element
	 * @param  {String} text - content to convert
	 * @return {String}
	 */
	function trust (text) {
		return {
			content: text, 
			trust: __true, 
			$: __true
		}
	}

	/**
	 * animate component/element
	 * 
	 * - adds `animating` class to document.body and element passed
	 * while animating, removes them when the animation is done.
	 *
	 * @param  {Element} element   
	 * @param  {Array}   transforms 'describe additional transforms'
	 * @param  {Number}  duration   'duration of the animation'
	 * @param  {String}  className  'class that represents end state animating to'
	 * 
	 * @return {Void}
	 *
	 * @example
	 * h('.card', {onclick: animate}, h('p', null, a)) 
	 * // className defaults to animation-active end class
	 * // duration defaults to 220ms
	 * // or 
	 * h('.card', {onclick: animate(400, 'active-state', null, 'linear')})
	 * // or 
	 * animate(duration{400},'endClassName'{'.class'},'extra transforms'{'rotate(25deg)')})
	 */
	function animate (duration, className, transform, transformOrigin, easing) {
		return function (element) {
			var first, 
				last, 
				webAnimations, 
				invert           = {},
				element          = element.currentTarget || element,
				style            = element.style,
				elementClassList = element.classList,
				bodyClassList    = __document.body.classList,
				runningClass     = 'animation-running',
				transEvtEnd      = 'transitionend';

			// can't animate without an end state class
			if(!className) {
				return
			}

			// animation type
			// if this is set we opt for the more performant
			// web animations api
			if (isType(element.animate, __function)) {
				webAnimations = __true
			}

			// promote element to individual composite layer
			style.willChange = 'transform';

			// get first state
			first = element.getBoundingClientRect(element);
			// assign last state
			elementClassList.toggle(className);
			// get last state
			last  = element.getBoundingClientRect(element);

			// get invert values
			invert.x  = first.left   - last.left,
			invert.y  = first.top    - last.top,
			invert.sx = first.width  / last.width,
			invert.sy = first.height / last.height,

			duration  = duration || 200,
			easing    = easing   || 'cubic-bezier(0,0,0.32,1)',
			first     = 'translate('+invert.x+'px,'+invert.y+'px) translateZ(0)'+
						' scale('+invert.sx+','+invert.sy+')',
			first     = transform ? first + ' ' + transform : first,
			last      = 'translate(0,0) translateZ(0) scale(1,1) rotate(0) skew(0)';

			// assign transform origin if set
			if (transformOrigin) {
				style.transformOrigin = transformOrigin
			}

			// reflect animation state on dom
			elementClassList.add(runningClass);
			bodyClassList.add(runningClass);

			// use native web animations api if present
			// presents better performance
			if (webAnimations) {
				var player = element.animate([
				  {transform: first},
				  {transform: last}
				], {
					duration: duration,
					easing:   easing
				});

				player.addEventListener('finish', onfinish)
			} else {
				style.transform  = first;
				// trigger repaint 
				element.offsetWidth;
				style.transition = 'transform '+duration+'ms '+easing,
				style.transform  = last
			}

			// cleanup
			function onfinish (e) {
				if (!webAnimations) {
					// bubbled events
					if (e.target !== element) {
						return
					}
					style.transition  = __null,
					style.transform   = __null;
				}
				style.transformOrigin = __null,
				style.willChange      = __null;

				elementClassList.remove(runningClass);
				bodyClassList.remove(runningClass);
				element.removeEventListener(transEvtEnd, onfinish)
			}

			if (!webAnimations) {
				element.addEventListener(transEvtEnd, onfinish)
			}
		}
	}


	/* --------------------------------------------------------------
	 * 
	 * Exports
	 * 
	 * -------------------------------------------------------------- */

	__window.surl    = new surl,
	__window.h       = __window.surl.Element,
	__window.bind    = bind,
	__window.trust   = trust,
	__window.animate = animate;
}());