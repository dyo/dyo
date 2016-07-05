/*!
 * surl.js 
 * a react like virtual dom library
 * @author Sultan Tarimo <https://github.com/thysultan>
 * @license MIT
 */

(function (root, factory) {
	'use strict';

	// amd
    if (typeof define === 'function' && define.amd) {
        // register as an anonymous module
        define([], factory)
    }
    // commonjs
    else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        factory(exports)
    } 
    // browser globals
    else {
        factory(root)
    }
}(this, function (exports) {
	'use strict';

	// references for better minification
	// so instead of obj.constructor we would do obj[__constructor]
	// the minifier will be able to minify that to something like
	// o[c] while it can't do the same for the former
	var

	// objects
	__namespace 				= {
		math:  'http://www.w3.org/1998/Math/MathML',
		xlink: 'http://www.w3.org/1999/xlink',
		svg:   'http://www.w3.org/2000/svg'
	},
	__document                  = document,
	__window                    = window,

	// types
	__null                      = null,
	__false                     = false,
	__true                      = true,
	__undefined                 = void 0,

	// properties
	__constructor               = 'constructor',
	__prototype                 = 'prototype',
	__length                    = 'length',

	// lifecycle properties
	getInitialState           = 'getInitialState',
	getDefaultProps           = 'getDefaultProps',
	componentWillReceiveProps = 'componentWillReceiveProps',
	componentDidMount         = 'componentDidMount',
	componentWillMount        = 'componentWillMount',
	componentWillUnmount      = 'componentWillUnmount',
	componentWillUpdate       = 'componentWillUpdate',
	componentDidUpdate        = 'componentDidUpdate',
	shouldComponentUpdate     = 'shouldComponentUpdate',

	// functions
	__number                    = Number,
	__array                     = Array,
	__object                    = Object,
	__function                  = Function,
	__boolean                   = Boolean,
	__string                    = String,
	__XMLHttpRequest            = XMLHttpRequest,
	__encodeURIComponent        = encodeURIComponent,

	/**
	 * check Object type
	 * @param  {Any}  obj  - object to check for type
	 * @param  {Any}  type - type to check for
	 * @return {Boolean}   - true/false
	 */
	is = (function () {
		function is (obj, type) {
			// only check if obj is not a falsey value
			if (!type) {
				return obj ? true : false
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

		return is
	}()),


	/**
	 * 'forEach' shortcut
	 * @param  {Array|Object} a 
	 * @param  {Function}     fn
	 * @param  {Boolean}      multiple
	 * @return {Array|Object}
	 */
	each = (function () {
		function each (arr, fn) {
			// index {Number}
			var 
			index

			// Handle arrays, and array-like Objects, 
			// array-like objects (have prop .length 
			// that is a number) and numbers for keys [0]
			if (
				is(arr, __array) || arr[__length] && 
				is(arr[__length], __number) && arr[0]
			) {
				// length {Number}
				var 
				length = arr[__length]
				index = 0

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

		return each
	}()),


	/**
	 * ajax helper
	 * @param  {Object}   settings `ajax settings object`
	 * @param  {Function} callback `function to run onload`
	 * @example
	 * // returns xhr Object
	 * ajax({url, method, data}, fn(res, err) => {})
	 */
	ajax = (function () {
		function ajax (url, method, data, callback) {
			return new promise(function (resolve, reject) {
				var 
				xhr      = new __XMLHttpRequest(),
				location = __window.location,
				sent

				// create anchor element to extract usefull information
				var 
				a        = __document.createElement('a')	
				a.href   = url

				// check if is this a cross origin request check
				var
				CORS = !(
					a.hostname        === location.hostname &&
					a.port            === location.port     &&
					a.protocol        === location.protocol &&
					location.protocol !== 'file:'
				)

				// destroy created element
				a = __null
				
				// open request
				xhr.open(method, url, __true)
				
				// assign on load callback
				xhr.onload = function () {
					var 
					response,
					responseText = xhr.responseText,
					statusText   = xhr.statusText;
					
					// success
					if (xhr.status >= 200 && xhr.status < 400) {
						// get response header
						var 
						resHeader = xhr.getResponseHeader("content-type"),
						resType

						// format response header
						// to get the type of response
						// that we can use to format the data
						// if needed i.e create dom/parse json
						if (resHeader.indexOf(';') !== -1) {
							resType = resHeader.split(';');
							resType = resType[0].split('/')
						}
						else {
							resType = resHeader.split('/')
						}

						// extract response type 'html/json/text'
						resType = resType[1]

						// json, parse json
						if (resType === 'json') {
							response = JSON.parse(responseText)
						}
						// html, create dom
						else if (resType === 'html') {
							response = (new DOMParser()).parseFromString(responseText, "text/html")
						}
						// text, as is
						else {
							response = responseText
						}

						// use callbacks
						if (callback) {
							callback(response)
						}
						// otherwise resolve promise
						else {
							resolve(response)
						}
					}
					// failed
					else {
						// use callbacks
						if (callback) {
							callback(statusText)
						}
						// otherwise resolve promise
						else {
							reject(statusText)
						}
					}
				}

				// assign on error callback
				xhr.onerror = function () {
					reject(xhr.statusText)
				}
				
				// set for this is a cross origin request
				if (CORS) {
					xhr.withCredentials = __true
				}

				// serialize settings for POST request
				if (method === 'POST') {
					xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
					sent = param(data)
				}
				// stringify non GET requests i.e PUT/DELETE...
				else if (method !== 'GET') {
					xhr.setRequestHeader('Content-Type', is(data, __object) ? 'application/json' : 'text/plain')
					sent = JSON.stringify(data)
				}

				// send request
				xhr.send(sent)
			})	
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
			var arr = []

			for (var key in obj) {
			    var 
			    __prefix = prefix ? prefix + '[' + key + ']' : key,
			    value    = obj[key]

			    // when the value is equal to an object 
			    // that means that we have something like
			    // data = {name:'John', addr: {...}}
			    // so we re-run param on addr to serialize 'addr: {...}'
			    arr.push(typeof value == 'object' ? 
			    	param(value, __prefix) :
			    	__encodeURIComponent(__prefix) + '=' + __encodeURIComponent(value))
			}

			return arr.join('&');
		}

		/**
		 * simple promise implementation
		 * @param {Function} 
		 * @return {Object} {then, done}
		 */
		function promise (fn) {
	  		var
	  		value,
	  		state = 'pending',
	  		deferred = __null

	  		function reject (reason) {
	  		    state = 'rejected';
	  		    value = reason

	  		    if(deferred) {
  		      		handle(deferred)
	  		    }
  		  	}

	  		function resolve (newValue) {
	  			try {
	  				if (newValue && is(newValue.then, __function)) {
		  			    newValue.then(resolve, reject)
		  			    return
				  	}
				  	
		    		value = newValue
		    		state = 'resolved'

		    		if (deferred) {
		      			handle(deferred)
		    		}
	  			} catch (e) {
	  				reject(e)
	  			}
	  		}

	  		function handle (handler) {
	    		if (state === 'pending') {
	      			deferred = handler
	      			return
	    		}

	    		setTimeout(function () {
		    		var 
		    		handlerCallback

	    		    if (state === 'resolved') {
			      		handlerCallback = handler.onResolved
	    		    } 
	    		    else {
			      		handlerCallback = handler.onRejected
	    		    }

	    		    if (!handlerCallback) {
			      		if (state === 'resolved') {
			        		handler.resolve(value)
			      		} 
			      		else {
			        		handler.reject(value)
			      		}

			      		return
	    		    }

	    		    var ret
		            try {
		                ret = handlerCallback(value);
		                handler.resolve(ret)
		            } 
		            catch (e) {
		                handler.reject(e)
		            }
	    		}, 0)
	  		}

	  		this.then = function (onResolved, onRejected) {
	    		return new promise (function(resolve, reject) {
		      		handle({
		        		onResolved: onResolved,
		        		onRejected: onRejected,
		        		resolve: resolve,
		        		reject: reject
		      		})
	    		})
	  		}

	  		this.done = function (onFulfilled, onRejected) {
  		  		var self = arguments[__length] ? this.then.apply(this, arguments) : this

  		  		self.then(__null, function (err) {
  		    		setTimeout(function () {
  		      			throw err
  		    		}, 0)
  		  		})
	  		}

	  		fn(resolve, reject)
		}

		return ajax
	}()),


	/**
	 * create virtual element : h()
	 * @param  {String} type  - Element, i.e: div
	 * @param  {Object} props - optional properties
	 * @return {Object}       - {type, props, children}
	 * @example
	 * h('div', {class: 'close'}, 'Text Content')
	 * h('div', null, h('h1', 'Text'));
	 */
	element = (function () {
		function element (type, props) {
			var args   = arguments,
				length = args[__length],
				key    = 2,
				child

			// no props specified default 2nd arg to children
			// is an hyperscript object or not 
			// an object (null,undefined,string,array,bool)
			if (isElement(props) || !is(props, __object)) {
				key   = 1,
				props = {}
			}
			// insure props is always an object
			else if (
				props === __null || 
				props === __undefined || 
				!is(props, __object)
			) {
				props = {}
			}

			// declare hyperscript object
			var obj = {type: type, props: props, children: []};

			// check if the type is a special case i.e [type] | div.class | #id
			// and alter the hyperscript
			if (
				type.indexOf('[') !== -1 ||
				type.indexOf('#') !== -1 || 
				type.indexOf('.') !== -1
			) {
				obj = parseElementType(obj)
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
				child = args[i]
		
				// if the child is an array go deeper
				// and set the 'arrays children' as children
				if (is(child, __array)) {
					for (var k = 0; k < child[__length]; k++) {
						obj.children[(i-key) + k] = setChild(child[k], obj)
					}
				}
				// deep enough, add this child to children
				else {
					obj.children[i - key] = setChild(child, obj)
				}
			}

			return obj
		}

		function isElement (obj) {
			// object exists
			// has type, children and props
			var maybe = obj &&
					    obj.type &&
					    obj.children &&
					    obj.props

			// end quickly
			// the object is not
			// a hyperscript object
			if (!maybe) return __false

			// well, it probably is
			// but just to be sure
			// we check if it only has 3 properties
			var length = 0;
			for (var name in obj) {
				// end quickly
				// we don't need to loop through
				// all the objects props
				// we now know it's not an object
				if (length > 3) {
					break
				}
				// add 1 to length if the object
				// has the prop
				else if (obj.hasOwnProperty(name)) {
					length++
				}
			}

			return length === 3
		}

		/**
		 * hyperscript set children
		 * @param  {Any} a
		 * @return {String|Array|Object}
		 */
		function setChild (child, obj) {
			// add obj.prop to children if they are none TextNodes
			if (child && is(child.props, __object) && obj.props.xmlns) {
				child.props.xmlns = obj.props.xmlns
			}

			// convert to string non hyperscript children
			if (!(is(child, __object) && isElement(child))) {
				// we don't want [object Object] strings
				if (is(child, __object)) {
					child = JSON.stringify(child)
				}
				// for non objects adding a strings is enough 
				else {
					child = child + ''
				}

				// convert the null, and undefined strings to empty strings
				// we don't convert false since that could 
				// be a valid textnode value returned to the client
				if (child === 'null' || child === 'undefined') {
					child = ''
				}
			}
			
			return child
		}

		/**
		 * hyperscript tagger
		 * @param  {Object} a - object with opt props key
		 * @param  {Object} b - tag
		 * @return {[Object]} - {props, type}
		 * @example
		 * // return {type: 'input', props: {id: 'id', type: 'checkbox'}}
		 * tag('inpu#id[type=checkbox]')
		 */
		function parseElementType (obj) {
			var 
			classes = [], 
			match,
			// regex to parse type/tag
			re = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g,

				// copy obj's props to abstract props and type
				// incase obj.props is empty create new obj
				// otherwise just add to already available object
				// we will add this back to obj.props later
				props = !obj.props ? {} : obj.props,

				// since we use type in a while loop
				// we will be updating obj.type directly
				type = obj.type

				// set default type to a div
				obj.type = 'div'

			// execute the regex and loop through the results
			while ((match = re.exec(type))) {
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
			obj.props = props
			
			// done
			return obj
		}

		return element
	}()),
	
	/**
	 * component lifecycle trigger
	 * @param  {Object}         node  - component, or hyperscript
	 * @param  {String}         state - stage of the lifecycle
	 * @param  {Boolean|Object} props - weather to pass props to stage
	 * @param  {Boolean|Object} state - weather to pass sate to stage
	 * @params {Boolean}        isCmp - weather this is a component or not
	 */
	lifecycle = (function () {
		function lifecycle (node, stage, props, state, isComponent) {
			// end quickly
			// if node is not a Component or hyperscript object
			if (!node || (!node.Component && !node.render)) {
				return
			}

			// if node is a component then Component = node
			// otherwise Component = node.Component
			// if the node is not a components parent
			// Element .Component will not exist which means
			// no lifecycle methods exist as well
			// so the next if (Component ...) block will end quickly
			var 
			Component = isComponent ? node : node.Component;

			if (Component && Component[stage]) {
				// is props/state truthy if so check if it is not a boolean
				// if so default to the value in props/state passed, 
				// if it is default to the Components props
				// if props/state is falsey default 
				// to what the value of props was before,
				// which is undefined
				props = props ? (!is(props, __boolean) ? props : Component.props) : __undefined,
				state = state ? (!is(state, __boolean) ? state : Component.state) : __undefined

				// componentShouldUpdate returns a Boolean
				// so we publish the lifecycle return values
				// which we can use in the draw - update () function
				// to see if we should skip an element or not
				return Component[stage](props, state)
			}
		}

		return lifecycle
	}()),


	/**
	 * diff virtual component and update dom
	 * @param {Element} parent   - dom mount node
	 * @param {Object}  newNode  - virtual element of components current state
	 * @param {Object}  oldNode? - virtual element of compoents previous state
	 * @param {Number}  index? 
	 * @param {Object}  render?  - component object
	 */
	draw = (function () {
		// draw interface
		function draw (mount, newNode, oldNode, Component) {
			if (Component) {
				lifecycle(newNode, componentWillMount)
			}

			update(mount, newNode, oldNode, __undefined, Component)
		}

		// diff and update dom loop
		function update (parent, newNode, oldNode, index, Component) {
			index = index || 0
			
			// should component update
			// if false exit quickly
			if (lifecycle(newNode, shouldComponentUpdate, __true, __true) === __false) {
				return
			}

			// adding to the dom
			if (oldNode === __undefined) {
				var 
				nextNode = createElement(newNode, Component)

				if (Component) {
					lifecycle(newNode, componentDidMount, nextNode)
				}
				parent.appendChild(nextNode)
			} 
			// removing from the dom
			else if (newNode === __undefined) {
				var 
				nextNode = parent.childNodes[index]

				function remove () {
					// insure the node we are trying to remove
					// actually still exists
					if (nextNode) {
						parent.removeChild(nextNode)
					}
				}

				// push to the end of the event/render stack
				// ensuring the dom is always up to date
				// before we run removeChild
				if (is(requestAnimationFrame, __function)) {
					requestAnimationFrame(remove)
				}
				else {
					setTimeout(remove, 0)
				}
			}
			// replacing a node
			else if (nodeChanged(newNode, oldNode)) {
				var 
				prevNode = parent.childNodes[index],
				nextNode = createElement(newNode)

				// same thing, end of the event stack
				parent.replaceChild(nextNode, prevNode)
			}
			// the lookup loop
			else if (newNode.type && !newNode.trust) {
				var 
				// get changes to props/attrs
				propChanges = getPropChanges(
					parent.childNodes[index], 
					newNode.props, 
					oldNode.props, 
					newNode
				)

				// if there are any prop changes,
				// update component props
				if (propChanges[__length]) {
					// before props change
					lifecycle(newNode, componentWillUpdate, __true, __true)

					each(propChanges, function (obj) {
						updateProp(obj.target, obj.name, obj.value, obj.op)
					})

					// after props change
					lifecycle(newNode, componentDidUpdate, __true, __true)
				}
				
				// loop through all children
				var
				newLength = newNode.children[__length],	
				oldLength = oldNode.children[__length]

				for (var i = 0; i < newLength || i < oldLength; i++) {
					update(parent.childNodes[index], newNode.children[i], oldNode.children[i], i)
				}
			}
		}

		// diffing two nodes
		function nodeChanged (node1, node2) {
			var 
			// diff object type
			obj = node1[__constructor] !== node2[__constructor],

			// diff text content
			// if this is text content diff it's string content
			text   = is(node1, __string) && node1 !== node2,

			// diff node type
			// if this is an element diff it's type
			// i.e node.type: div !== node.type: h2
			// will return true, signaling that we should
			// replace the node
			type   = node1.type !== node2.type,

			// diff key (assign default state of false)
			key    = __false

			// not textNode
			if (node1.props && node2.props) {
				// check if keys are the same
				// if there is no keys property in props
				// this will just be undefined !== undefined
				// which will be false/same as if the keys where the same
				key = node1.props.key !== node2.props.key
			}
			
			// if either key/text/type/object constructor has changed
			// this will return true
			// thus signaling that we should replace the node
			return key || text || type || obj
		}

		// create element
		function createElement (node, Component) {
			// handle text nodes
			if (is(node, __string)) {
				return __document.createTextNode(node)
			}
			// trusted text content
			else if (node.trust) {				
				var 
				div  = __document.createElement('div'),
				frag = __document.createDocumentFragment()

				div.innerHTML = node.children[0];
				var nodes     = __array[__prototype].slice.call(div.childNodes)

				each(nodes, function (value) {
					frag.appendChild(value)
				})

				return frag
			}

			var el

			// not a text node 
			// check if it is namespaced
			if (node.props && node.props.xmlns) {
				el = __document.createElementNS(node.props.xmlns, node.type)
			}
			else {
				el = __document.createElement(node.type)
			}
			
			// diff and update/add/remove props
			setElementProps(el, node.props)
			// add events if any
			addEventListeners(el, node.props)
			
			// only map children arrays
			if (is(node.children, __array)) {
				each(node.children, function (child) {
					el.appendChild(createElement(child, Component))
				})
			}

			// add refs
			// Component is only present
			// on the initial render
			// so this will only run once
			if (Component) {
				var 
				props = node.props,
				ref   = props ? props.ref : __undefined

				// component has a ref add to parent component
				if (ref) {
					// if we have already set a refs object
					// use the same object
					Component.refs = Component.refs || {}

					// ref is a function run it
					// passing the el to it
					if (is(ref, __function)) {
						ref(el)
					}
					// add ref to component
					else if (is(ref, __string)) {
						Component.refs[ref] = el
					}
				}
			}
		
			return el
		}

		// check if props is event
		function isEventProp (name, value) {
			// checks if the first two characters are on
			return name.substring(0,2) === 'on' && is(value, __function)
		}
		
		// get event name
		function extractEventName (name) {
			// removes the first two characters and converts to lowercase
			return name.substring(2, name[__length]).toLowerCase()
		}
		
		// add event
		function addEventListeners (target, props) {
			for (var name in props) {
				var 
				value = props[name]

				if (isEventProp(name, value)) {
					// is a callback
					if (value) {
						target.addEventListener(extractEventName(name), value, __false)
					}
				}
			}
		}
		
		// update props
		function getPropChanges (target, newProps, oldProps, newNode) {
			var changes  = []

			oldProps = oldProps !== __undefined ? oldProps : {}

			// merge old and new props
			var
			props = {}

			for (var name in newProps) { props[name] = newProps[name] }
			for (var name in oldProps) { props[name] = oldProps[name] }
		
			// compare if props have been added/delete/updated
			// if name not in newProp[name] : deleted
			// if name not in oldProp[name] : added
			// if name in oldProp !== name in newProp : updated
			for (var name in props) {
				var 
				oldVal = oldProps[name],
				newVal = newProps[name],
				// returns true/false if the prop has changed from it's prev value
				remove = newVal === __undefined || newVal === __null,
				// says only diff this if it's not an event i.e onClick...
				add    = oldVal === __undefined || 
						oldVal === __null || 
						(newVal !== oldVal && !isEventProp(name, props[name])),

				// store value
				value  = remove === -1 ? oldVal : newVal

				// something changed
				if (add || remove) {
					// we can then add this to the changes arr
					// that we can check later to see if any props have changed
					// and update the props that have changed
					changes.push({
						target: target, 
						name:   name, 
						value:  value,
						op: add || remove
					})
				}
			}

			return changes
		}
		
		// initial creation of props, 
		// no checks, just set
		function setElementProps (target, props) {
			for (var name in props) {
				updateProp(target, name, props[name], +1)
			}
		}

		// assign/update/remove prop
		function updateProp (target, name, value, op) {
			// don't add events/refs/keys as props/attrs
			if (isEventProp(name, value) || name === 'ref' || name === 'key') {
				return
			}

			// remove / add attribute reference
			var 
			attr = (op === -1 ? 'remove' : 'set') + 'Attribute';
		
			// set xlink:href attr
			if (name === 'xlink:href') {
				return target.setAttributeNS(__namespace['xlink'], 'href', value)
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

		return draw
	}()),


	/**
	 * surl
	 * @param  {Element?} mount - optional parent element
	 * @return {surl}           - {settings, parent, router, vdom}
	 */
	surl = (function () {
		function surl (mount) {
			// we are going to be doing this alot when we use this alot
			// it allows the minified to then convert all self to shorter alternatives
			// since you can't minify 'this' or Fn.bind
			var self = this;

			// element specified on instantiation
			// set mount element
			if (mount) {
				self.Mount(mount)
			}
		}

		surl[__prototype] = {
			/**
			 * make ajax requests
			 * @return {Object} xhr object
			 */
			Req: function Req (url, method, data, callback) {
				method = method || 'GET'
				data   = data || {}

				// return ajax promise
				return ajax(url, method.toUpperCase(), data, callback)
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
				else if (is(element, __string)) {
					element = __document.querySelector(element)
				}

				// assign mount if element
				if (element && element.nodeType) {
					self.mount = element
				}
				// for references sake
				// incase you want to see all the properties
				// of an instance
				else {
					self.mount = __undefined
				}
			},

			/**
			 * initialize/mount
			 * @param {String} id - base component to mount to dom
			 */
			Render: function Render (Component, element, data) {
				var self = this

				// add parent element
				if (element) {
					// string? query element
					if (is(element, __string)) {
						self.mount = __document.querySelector(element)
					}
					// element? add
					else if (element.nodeType) {
						self.mount = element
					}
				}

				// has parent to mount to
				if (self.mount) {
					var
					currentComponent = self.component

					if (currentComponent) {
						currentComponent = currentComponent(__undefined, __undefined, true)

						lifecycle(
							currentComponent, 
							componentWillUnmount, 
							__undefined, 
							__undefined, 
							__true
						)
					}

					// clear dom
					self.mount.innerHTML = ''

					// probably a plain hyperscript object
					// create class with render fn that returns it
					if (is(Component, __object)) {
						// hyperscript object
						var hyperscript = Component;
						// create component
						Component = self.Component({render: function () { return hyperscript } })
					}

					Component = Component || self.component
					// add vdom objects
					self.render = Component(data)
					self.component = Component

					// initial mount to dom
					// we don't specify a old node here
					// which just means everything is new
					// so there will be no diffing involved
					// we also pass the Component Object
					// which we can use to add refs if set
					draw(
						self.mount,
						self.render,
						__undefined,
						Component(__undefined, __undefined, __true)
					)
				}
				// can't find element to mount to
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
				var 
				that = this

				// allows us to do something like
				// function Users(){
				// 		function onClick () {
				// 		}
				// 		return {
				// 			render: function () {
				// 				return h('div', {onClick: onClick})
				// 			}
				// 		}
				// }
				// .render(.Component(Users), element)
				if (is(args, __function)) {
					return that.Component(args())
				}

				// add props, state namespace
				args.props = {}
				args.state = {}

				// create component
				function ComponentClass () {
					var 
					self = this
					// add props to component
					each(args, function (value, name) {
						// bind the component scope to all methods
						if (is(value, __function)) {
							value = value.bind(self)
						}

						// assign property/method
						self[name] = value
					})
				}

				// add setState and setProps methods to prototype
				each(['Props', 'State', 'forceUpdate'], function (method) {
					// state/props
					var 
					type = method.toLowerCase()

					// add setters
					if (method === 'Props' || method === 'State') {
						// cmpClass.prototype.setState/setProps
						ComponentClass[__prototype]['set'+method] = function (obj, callback, update) {
							var 
							self = this

							// the obj passed in setState({obj}) / setProps({obj})
							if (obj) {
								// obj is a function that returns the setState({obj})
								if (is(obj, __function)) {
									// get the returned value
									obj = obj(self.state, self.props)
								}

								// exit early if obj is not an object
								if (!is(obj, __object)) {
									throw 'setState() takes an object or a function that returns an object'
								}

								each(obj, function (value, name) {
									self[type][name] = value
								})

								// only trigger render for setState()
								// !update also allows us to call setState without
								// triggering a re-render
								// that.render is to make sure we have a base
								// component to render
								if (type === 'state' && !update && that.render) {
									// new node
									var 
									newNode = that.component()

									// diff new vs old node
									draw(that.mount, newNode, that.render)

									// set the old node to the new node
									// we will use this in the next render
									// as the old node
									that.render = newNode
								}
							}
						}
					}
					// add forceUpdate method
					else if (method === 'forceUpdate') {
						ComponentClass[__prototype]['forceUpdate'] = function (callback) {
							draw(that.mount, that.component(), that.render)
							
							if (is(callback, __function)) {
								callback()
							}
						}
					}
				})

				// create component object
				var 
				ComponentObject = new ComponentClass

				// we need render to render
				// publish error
				if (!ComponentObject.render) {
					throw 'no render method'
				}

				// get and set initial state
				if (ComponentObject[getInitialState]) {
					ComponentObject.setState(
						ComponentObject[getInitialState](), 
						__undefined, 
						__false
					)
				}
				// get and set default props
				if (ComponentObject[getDefaultProps]) {
					ComponentObject.setProps(
						ComponentObject[getDefaultProps](), 
						__undefined, 
						__false
					)
				}

				// create components render returned hyperscript object
				function hyperscript (obj) {
					var 
					self = this
					self.type     = obj.type,
					self.props    = obj.props,
					self.children = obj.children
				}

				// add lifecycle methods to render
				each(ComponentObject, function (value, name) {
					hyperscript[__prototype].Component = ComponentObject
				})

				// re add default object constructor
				hyperscript[__prototype][__constructor] = __object

				// re-create render function with new hyperscript obj
				var
				render = ComponentObject.render

				ComponentObject.render = function () {
					return new hyperscript(render())
				}

				// create component returned function
				function Component (props, children, getCmpObj) {
					// first publish that the component
					// will receive props that are not children
					// if props is set
					if (props) {
						lifecycle(
							ComponentObject, 
							componentWillReceiveProps, 
							props,
							__undefined,
							__true
						)
					}

					// we have both props and children
					// merge them
					if (props && children) {
						props.children = children
					}
					// we only have children
					// create props obj with children child
					else if (!props && children) {
						props = {},
						props.children = children
					}

					// we have props to set?
					// set them
					if (props) {
						ComponentObject.setProps(props)
					}

					if (getCmpObj) {
						// return component object
						return ComponentObject
					}
					else {
						// return hyperscript
						return ComponentObject.render()
					}
				}

				return Component
			},

			/**
			 * DOM creates html hyperscript functions to the global scope
			 * such that h('div', {}, 'Text') can be written as
			 * div({}, 'Text')
			 */
			DOM: function DOM () {
				each(['doctype','a','abbr','address','area','article','aside',
				'audio','b','base','bdi','bdo','blockquote','body','br','button',
				'canvas','caption','cite','code','col','colgroup','command',
				'datalist','dd','del','details','dfn','div','dl','dt','em','embed',
				'fieldset','figcaption','figure','footer','form','h1','h2','h3',
				'h4','h5','h6','head','header','hgroup','hr','html','i','iframe',
				'img','input','ins', 'kbd','keygen','label','legend','li','link',
				'map','mark','menu','meta','meter','nav','noscript','object','ol',
				'optgroup','option','output','p','param','pre','progress','q','rp',
				'rt','ruby','s','samp','script','section','select','small','source',
				'span','strong','style','sub','summary','sup','table','tbody','td',
				'textarea','tfoot','th','thead','time','title',
				'tr','track','u','ul','var','video','wbr'], function (name) {
					__window[name] = function Element () {
						// convert args to array
						var args = __array[__prototype].slice.call(arguments);
							// add name as first arg
							// which represents the tag in hyperscript
							args.unshift(name);

						return h.apply(null, args)
					}
				})
			},

			/**
			 * Creates a router interface
			 * @param {Object} args - {mount, addr?, init?, routes}
			 * @example
			 * app.Route({
			 * 		mount: '.app'     // selector|element
			 * 		addr: '/example', // string
			 * 		init: '/user/id'  // initial route, defaults to current uri
			 * 		routes: {
			 * 			'/route.html': Home, // where Home/User is a component
			 * 			'/:page/:name': User
			 * 		}
			 * })
			 */
			Route: function (args) {
				function Router () {
					// data
					this.settings = {},
					this.url = __null,
					this.interval = __null,

					// history back
					this.back = function () {
						history.back()
					},
					// history foward
					this.foward = function () {
						history.foward()
					},
					// history go
					this.go = function (index) {
						history.go(index)
					},
					// navigate to a view
					this.nav = function (url) {
						var addr = this.settings.addr
						
						url  = addr ? addr + url : url

						history.pushState(__null, __null, url)
					},
					// kills the rAf animation loop and clears the routes
					this.destroy = function () {
						this.routes = {}
						clearInterval(this.interval)
					},
					// configure defualts
					this.config = function (obj) {
						var self = this;

						each(obj, function(value, name) {
							self.settings[name] = value
						})
					},
					// start listening for url changes
					this.init = function () {
						var 
						self = this,
						fn   = function () {
							var url = __window.location.pathname

							if (self.url !== url) {
								self.url = url
								self.changed()
							}
						}

						clearInterval(self.interval)
						// start listening for a change in the url
						self.interval = setInterval(fn, 50)
					},
					// register routes
					this.on = function (args) {
						var self = this,
							routes;

						// create routes object if it doesn't exist
						if (!self.routes) {
							self.routes = {}
						}

						// normalize args for ({obj}) and (url, callback) styles
						if (!is(args, __object)) {
							var args   = arguments

							routes = {}
							routes[args[0]] = args[1]
						}
						else {
							routes = args
						}

						// assign routes
						each(routes, function (value, name) {
							var addr = self.settings.addr,
								variables = [],
								regex = /([:*])(\w+)|([\*])/g,
								// given the following /:user/:id/*
								pattern = name.replace(regex, function () {
											var args = arguments,
												id   = args[2]
												// 'user', 'id', undefned

											// if not a variable 
											if (!id) {
												return '(?:.*)'
											}
											// capture
											else {
												variables.push(id)
												return '([^\/]+)'
											}
										}),
								// lock pattern
								pattern = pattern + '$'

							self.routes[name] = {
								callback:  value,
								pattern:   addr ? addr + pattern : pattern,
								variables: variables
							}
						})
					},
					this.changed = function () {
						// references
						var 
						url    = this.url,
						routes = this.routes

						each(routes, function (val) {
							var callback  = val.callback,
								pattern   = val.pattern,
								variables = val.variables,
								match;

							// exec pattern on url
							match = url.match(new RegExp(pattern))

							// we have a match
							if (match) {
								// create params object to pass to callback
								// i.e {user: "simple", id: "1234"}
								var data = match
									// remove the first(url) value in the array
									.slice(1, match[__length])
									.reduce(function (data, val, i) {
										if (!data) {
											data = {}
										}
										// var name: value
										// i.e user: 'simple'
										data[variables[i]] = val
										return data
									}, __null)

								// callback is a function, exec
								if (is(callback, __function)) {
									// component function
									self.Render(callback, __undefined, data)
								}
								// can't process
								else {
									throw 'could not find render method'
								}
							}
						})
					}
				}

				var 
				self   = this,
				mount  = args.mount,
				addr   = args.addr,
				nav    = args.init,
				routes = args.routes,
				router = new Router

				// mount to dom
				if (mount) {
					self.Mount(mount)
				}
				// define root address
				if (addr) {
					router.config({addr: addr})
				}
				// assign routes
				if (routes) {
					router.on(routes)
				}

				// initialize listener
				router.init();

				// navigate to initial uri
				if (nav) {
					router.nav(nav)
				}

				// assign router to object
				self.route = router
			},

			/**
			 * hyperscript creator reference
			 * @type {Function}
			 */
			Element: element,
			createElement: element,

			/**
			 * Component creator reference
			 * @type {Function}
			 */
			createClass: function (obj) {
				return this.Component(obj)
			}
		}

		return surl
	}()),

	/**
	 * two-way data binding, not to be confused with Function.bind
	 * @param  {String} prop - the property/attr to look for in the element
	 * @param  {Object} obj  - the object to update
	 * @param  {String} key  - the key in the object to update
	 */
	bind = (function () {
		function bind (prop, Component, key) {
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
					value = (prop in el) ? el[prop] : el.getAttribute(prop)

					// just if(value) doesn't work if the value is false
					// and some prop values can be false
					// null and undefined = prop/attr doesn't exist
					if (value !== __undefined && value !== __null) {
						// round about way to do obj = {[key]: value}
						var 
						obj      = {}
						obj[key] = value

						// run the components setState
						Component.setState(obj)
					}
			}
		}

		return bind
	}()),

	/**
	 * flag as a trusted element
	 * @param  {String} text - content to convert
	 * @return {String}
	 */
	trust = (function () {
		function trust (text) {
			function hyperscript () {
				this.type = 'p',
				this.props = {},
				this.children = [text]
			}

			hyperscript[__prototype].trust = __true,
			hyperscript[__prototype][__constructor] = __object

			return new hyperscript
		}

		return trust
	}()),

	/**
	 * flip and transition animation helper
	 * @type {Object} {flip, animate}
	 */
	animate = (function () {
		/**
		 * flip animate component/element
		 * @param  {Element} element   
		 * @param  {Array}   transforms 'describe additional transforms'
		 * @param  {Number}  duration   'duration of the animation'
		 * @param  {String}  className  'class that represents end state animating to'
		 * @return {Void}
		 * @example
		 * h('.card', {onclick: animate}, h('p', null, a)) 
		 * // className defaults to animation-active end class
		 * // duration defaults to 220ms
		 * // or 
		 * h('.card', {onclick: animate(400, 'active-state', null, 'linear')})
		 * // or 
		 * animate(duration{400},'endClassName'{'.class'},'extra transforms'{'rotate(25deg)')})
		 */
		function flip (className, duration, transformations, transformOrigin, easing) {
			return function (element, callback) {
				transformations  = transformations || ''

				// get element if selector
				if (is(element, __string)) {
					element = document.querySelector(element)
				}

				// check if element exists
				if (!element && element.nodeType) {
					throw 'can\'t animate without an element'
				}

				var
				first, 
				last,
				webAnimations,
				transform        = {},
				invert           = {},
				element          = element.currentTarget || element,
				style            = element.style,
				body             = document.body,
				runningClass     = 'animation-running',
				transEvtEnd      = 'transitionend'

				// animation type
				// if this is set we opt for the more performant
				// web animations api
				if (is(element.animate, __function)) {
					webAnimations = __true
				}

				// promote element to individual composite layer
				if (style.willChange) {
					style.willChange = 'transform'
				}

				// get first rect state
				first        = getBoundingClientRect(element)
				// assign last state if there is an end class
				if (className) {
					element.classList.toggle(className)
				}
				// get last rect state, 
				// if there is not end class
				// then nothing has changed, save a reflow and just use the first state
				last         = className ? getBoundingClientRect(element) : first

				// get invert values
				invert.x  = first.left   - last.left,
				invert.y  = first.top    - last.top,
				invert.sx = last.width  !== 0 ? first.width  / last.width  : 1,
				invert.sy = last.height !== 0 ? first.height / last.height : 1

				duration  = duration || 200,
				easing    = easing   || 'cubic-bezier(0,0,0.32,1)',

				transform['1'] = 'translate('+invert.x+'px,'+invert.y+'px) translateZ(0)'+
								' scale('+invert.sx+','+invert.sy+')',
				transform['1'] = transform['1'] + ' ' + transformations,
				transform['2'] = 'translate(0,0) translateZ(0) scale(1,1) rotate(0) skew(0)'

				// assign transform origin if set
				if (transformOrigin) {
					prefix(style, 'transformOrigin', transformOrigin)
				}

				// reflect animation state on dom
				element.classList.add(runningClass)
				body.classList.add(runningClass)

				// use native web animations api if present for better performance
				if (webAnimations) {
					var 
					player = element.animate([
				  		{transform: transform['1']},
				  		{transform: transform['2']}
					], {
						duration: duration,
						easing:   easing
					})

					player.addEventListener('finish', onfinish)
				}
				// use css transitions
				else {
					// set first state
					prefix(style, 'transform', transform['1'])

					// trigger repaint
					element.offsetWidth
					
					// setup to animate when we change to the last state
					// will only transition transforms and opacity
					prefix(
						style, 
						'transition', 
						'transform '+duration+'ms '+easing + ', '+
						'opacity '+duration+'ms '+easing
					)

					// set last state
					prefix(style, 'transform', transform['2'])
				}

				// cleanup
				function onfinish (e) {
					if (!webAnimations) {
						// bubbled events
						if (e.target !== element) {
							return
						}

						prefix(style, 'transition', __null)
						prefix(style, 'transform', __null)
					}
					prefix(style, 'transformOrigin', __null)
					
					if (style.willChange) {
						style.willChange = __null
					}

					element.classList.remove(runningClass)
					body.classList.remove(runningClass)
					element.removeEventListener(transEvtEnd, onfinish)

					if (callback) {
						callback(element)
					}
				}

				if (!webAnimations) {
					element.addEventListener(transEvtEnd, onfinish)
				}

				return duration
			}
		}

		/**
		 * transition an element then run call back after
		 * the transition is complete
		 */
		function transition (className) {
			return function (element, callback) {
				// add transition class
				// this will start the transtion
				element.classList.add(className)

				var
				// duration starts at 0
				// for every time we find in transition-duration we add it to duration
				duration   = 0,
				// get transition duration and remove 's' and spaces
				// we will get from this '0.4s, 0.2s' to '0.4,0.2'
				// we then split it to an array ['0.4','0.2']
				// note: the numbers are still in string format
				transition = getComputedStyle(element)['transition-duration']
															.replace(/s| /g, '')
															.split(',')

				// increament duration (in ms), also convert all values to a number
				each(transition, function (value) {
					duration += parseFloat(value) * 1000
				})

				// run callback after duration of transition
				// has elapsed
				setTimeout(function () {
					callback(element)
				}, duration)
			}
		}

		/**
		 * get elements client rect and return a mutable object
		 * with top, left, width, and height values
		 * @param  {Element} element - element to run getBoundingClientRect on
		 * @return {Object}          - {top, left, width, height}
		 */
		function getBoundingClientRect (element) {
			var 
			rect = element.getBoundingClientRect()

			return {
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height
			}
		}

		/**
		 * prefix css props
		 * @param  {Object} style - the elements style object
		 * @param  {String} prop  - prop to set
		 * @param  {String} value - value of the prop
		 */
		function prefix (style, prop, value) {
			// exit early if we support un-prefixed prop
	  		if (style && style[prop] === __null) {
	  			// chrome, safari, mozila, ie
    			var vendors = ['webkit','Webkit','Moz','ms']

	      		for (var i = 0; i < vendors[__length]; i++) {
	      			// vendor + capitalized prop
	      			prop = vendors[i] + prop[0].toUpperCase() + prop.slice(1)

	      			// add prop if vendor prop exists
  					if (style[prop] !== __undefined) {
  						style[prop] = value
  					}
	      		}
    		}
    		// set un-prefixed prop
    		else {
    			style[prop] = value
    		}
		}

		return {
			flip: flip,
			transition: transition
		}
	}()),
	

	/**
	 * props utility
	 * @param {Any} store - value
	 */
	prop = (function () {
		/**
		 * props allows use to create getter and setters
		 * @param  {Any} store - value to store
		 * @return {Function}  - getter,setter function
		 * @example
		 * var a = prop(1)
		 * a() // => 1
		 * a('changed')
		 * a() // => 'changed'
		 * this becomes very usefull when coupled with
		 * callbacks that pass a value to the callback
		 * i.e
		 * app.Req('/url').then(a)
		 * when the request is done a will now have have
		 * response of the request 
		 */
		function prop (store) {
			// create the getter/setter
			function prop () {
				// we could use a name argument
				// but then again the value can be a falsy value
				// so if(value) wouldn't validate if the user passed a value
				// rather we check if the arguments object is not of length 0
				// which is what it will be if we don't pass an argument
				var
				args = arguments

				if (args[__length]) {
					store = args[0]
				}

				return store
			}

			// define .toJSON
			// so if we call JSON.stringify()
			// on the returned getter/setter
			// it returns the stored value
			prop.toJSON = function () {
				return store
			}

			return prop
		}

		return prop
	}())


	/* --------------------------------------------------------------
	 * 
	 * Exports
	 * 
	 * -------------------------------------------------------------- */


 	exports.prop    = prop,
	exports.surl    = surl,
	exports.h       = element,
	exports.bind    = bind,
	exports.trust   = trust,
	exports.animate = animate
}));