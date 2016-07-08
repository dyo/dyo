/*!
 * surl.js 
 * @author Sultan Tarimo <https://github.com/thysultan>
 * @license MIT
 */

(function (root, factory) {
	'use strict'

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
	'use strict'

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
	__childNodes                = 'childNodes',
	__children                  = 'children',
	__classList                 = 'classList',
	__className                 = 'className',

	// lifecycle properties
	__getInitialState           = 'getInitialState',
	__getDefaultProps           = 'getDefaultProps',
	__componentWillReceiveProps = 'componentWillReceiveProps',
	__componentDidMount         = 'componentDidMount',
	__componentWillMount        = 'componentWillMount',
	__componentWillUnmount      = 'componentWillUnmount',
	__componentWillUpdate       = 'componentWillUpdate',
	__componentDidUpdate        = 'componentDidUpdate',
	__shouldComponentUpdate     = 'shouldComponentUpdate',

	// functions
	__number                    = Number,
	__array                     = Array,
	__object                    = Object,
	__function                  = Function,
	__boolean                   = Boolean,
	__string                    = String,
	__XMLHttpRequest            = XMLHttpRequest,
	__encodeURIComponent        = encodeURIComponent,
	__setTimeout                = __window.setTimeout


	function classList (prop) {
		function hasClass (element, value) {
			// default to native Element.classList()
		    if (element[__classList]) {
		        return element[__classList].contains(value)
		    } 
		    else {
		    	// this will return true if indexOf does not
		    	// find our class in the className string 
		        return element[__className].indexOf(value) > -1
		    }
		}

		function add (element, value) {
			// default to native Element.classList.remove()
			if (element[__classList]) {
		        element[__classList].add(value)
		    }
		    // exit early if the class is already added
		    else if (!hasClass(element, value)) {
		    	// create array of current classList
		        var 
		        classes = element[__className].split(" ")
		        // add our new class
		        classes.push(value)
		        // join our classes array and re-assign to className
		        element[__className] = classes.join(" ")
		    }
		}

		function remove (element, value) {
			// default to native Element.classList.remove()
		    if (element[__classList]) {
		        element[__classList].remove(value)
		    }
		    else {
		    	// create array of current classList
		        var
		        classes = element[__className].split(" ")
		        // remove the className on this index
		        classes.splice(classes.indexOf(value), 1)
		        // join our classes array and re-ssign to className
		        element[__className] = classes.join(" ")
		    }
		}

		function toggle (element, value) {
			// default to native Element.classList.toggle()
		    if (element[__classList]) {
		        element[__classList].toggle(value)
		    }
		    else {
		    	// if has class, remove
		    	if (hasClass(element, value)) {
		    		remove(element, value)
		    	}
		    	// if does not have class, add
		    	else {
		    		add(element, value)
		    	}
		    }
		}

		return {
			add: add,
			remove: remove,
			hasClass: hasClass,
			toggle: toggle
		}
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
	function element () {
		function h (type, props) {
			var 
			args   = arguments,
			length = args[__length],
			key    = 2,
			child

			// no props specified default 2nd arg to children
			// is an hyperscript object or not 
			// an object (null,undefined,string,array,bool)
			if (isH(props) || !is(props, __object)) {
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
			var 
			obj = {type: type, props: props, children: []}

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

		function isH (obj) {
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
			if (!(is(child, __object) && isH(child))) {
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

		return h
	}

	
	/**
	 * 'forEach' shortcut
	 * @param  {Array|Object} a 
	 * @param  {Function}     fn
	 * @param  {Boolean}      multiple
	 * @return {Array|Object}
	 */
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
					return
				}
			}
		}
		// Handle objects 
		else {
			for (index in arr) {
				// break if fn() returns false
				if (fn.call(arr[index], arr[index], index, arr) === __false) {
					return
				}
			}
		}
	}


	/**
	 * check Object type
	 * @param  {Any}  obj  - object to check for type
	 * @param  {Any}  type - type to check for
	 * @return {Boolean}   - true/false
	 */
	function is (obj, type) {
		// only check if obj is not a falsey value
		if (!type) {
			return obj ? __true : __false
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
	 * component lifecycle trigger
	 * @param  {Object}         node  - component, or hyperscript
	 * @param  {String}         state - stage of the lifecycle
	 * @param  {Boolean|Object} props - weather to pass props to stage
	 * @param  {Boolean|Object} state - weather to pass sate to stage
	 * @params {Boolean}        isCmp - weather this is a component or not
	 */
	function lifecycle (node, stage, props, state, iscomp) {
		// end quickly
		// if node is not a Component or hyperscript object
		if (!node || (!node.internal && !node.render)) {
			return
		}

		// if node is a component then Component = node
		// otherwise Component = node.Component
		// if the node is not a components parent
		// Element .Component will not exist which means
		// no lifecycle methods exist as well
		// so the next if (Component ...) block will end quickly
		var
		component = iscomp ? node : node.internal;

		if (component && component[stage]) {
			// is props/state truthy if so check if it is not a boolean
			// if so default to the value in props/state passed, 
			// if it is default to the Components props
			// if props/state is falsey default 
			// to what the value of props was before,
			// which is undefined
			props = props ? (!is(props, __boolean) ? props : component.props) : __undefined,
			state = state ? (!is(state, __boolean) ? state : component.state) : __undefined

			// componentShouldUpdate returns a Boolean
			// so we publish the lifecycle return values
			// which we can use in the draw - update () function
			// to see if we should skip an element or not
			return component[stage](props, state)
		}
	}


	function debounce (fn, duration) {
		// when we want to send a custom duration
		// to setTimeout
		duration = duration || 0

		// push to the end of the event/render stack
		// ensuring the dom is always up to date
		// before we run any of the 
		// removeChild/appendChild/replaceChild
		// operations
		// we use requestAnimationFrame if it's
		// available
		// and fallback to setTimeout otherwise
		if (duration === 0 && is(requestAnimationFrame, __function)) {
			requestAnimationFrame(fn)
		}
		else {
			__setTimeout(fn, duration)
		}
	}


	/**
	 * diff virtual component and update dom
	 * @param {Element} parent   - dom node
	 * @param {Object}  newNode
	 * @param {Object}  oldNode?
	 * @param {Number}  index? 
	 * @param {Object}  component?
	 */
	function vdomToDOM (parent, newNode, oldNode, component) {
		update(parent, newNode, oldNode, __undefined, component)		

		// diff and update dom loop
		function update (parent, newNode, oldNode, index, component) {
			index = index || 0
			
			// should component update
			// if false exit quickly
			if (lifecycle(newNode, __shouldComponentUpdate, __true, __true) === __false) {
				return
			}

			// adding to the dom
			if (oldNode === __undefined) {
				var 
				nextNode = createElement(newNode, component)
				appendChild(parent, nextNode, newNode)
			} 
			// removing from the dom
			else if (newNode === __undefined) {
				var 
				nextNode = parent[__childNodes][index]

				removeChild(parent, nextNode, oldNode)
			}
			// removing/replacing a node
			// here we check if the nodes keys are the same
			// if they are different then the node that existed here before is now gone
			// so we remove it
			else if (newNode.props && oldNode.props && newNode.props.key !== oldNode.props.key) {
				var
				nextNode = parent[__childNodes][index]

				removeChild(parent, nextNode, oldNode)

				return __true
			}
			// replacing a node
			else if (nodeChanged(newNode, oldNode)) {
				var 
				prevNode = parent[__childNodes][index],
				nextNode = createElement(newNode)
				
				replaceChild(parent, nextNode, prevNode, newNode)		
			}
			// the lookup loop
			else if (newNode.type) {
				handlePropChanges(parent[__childNodes][index], newNode, oldNode)

				// loop through all children
				var
				newLength = newNode[__children][__length],	
				oldLength = oldNode[__children][__length]

				for (var i = 0; i < newLength || i < oldLength; i++) {
					// only replace returns a non falsy value
					// we will use that change to do some extra
					// checks on replaced elements
					if (
						update(
							parent[__childNodes][index], 
							newNode[__children][i], 
							oldNode[__children][i], 
							i
						)
					) {
						// if newNodes children length is large than the old one
						// remove the item in the children array
						// that was replaced
						// and decreement the newLength number
						if (newLength > oldLength) {
							newNode[__children].splice(i,1)
							newLength--
						}
						// the same as above but for oldNodes children
						else if (newLength < oldLength) {
							oldNode[__children].splice(i,1)
							oldLength--
						}
					}
				}	
			}
		}

		// remove element
		function removeChild (parent, nextNode, oldNode) {
			// check if componentWillUnmount returns somethings
			var 
			duration = lifecycle(oldNode, __componentWillUnmount, nextNode)

			// if what it returns is not a number
			// default to undefined
			if (!is(duration, __number)) {
				duration = __undefined
			}

			debounce(function () {
				// insure the node we are trying to remove
				// actually still exists
				if (nextNode) {
					parent.removeChild(nextNode)
				}
			}, duration)
		}

		// add element
		function appendChild (parent, nextNode, newNode) {
			lifecycle(newNode, __componentWillMount)

			if (nextNode) {
				parent.appendChild(nextNode)
			}

			lifecycle(newNode, __componentDidMount, nextNode)
		}

		// replace element
		function replaceChild (parent, nextNode, prevNode, newNode) {
			lifecycle(newNode, __componentWillUpdate)

			debounce(function () {
				if (nextNode && prevNode) {
					parent.replaceChild(nextNode, prevNode)
				}
			})

			lifecycle(newNode, __componentDidUpdate)
		}

		// diffing two nodes
		function nodeChanged (node1, node2) {
			var 
			// diff object type
			obj  = node1[__constructor] !== node2[__constructor],

			// diff text content
			// if this is text content diff it's string content
			text = is(node1, __string) && node1 !== node2,

			// diff node type
			// if this is an element diff it's type
			// i.e node.type: div !== node.type: h2
			// will return true, signaling that we should
			// replace the node
			type = node1.type !== node2.type
			
			// if either text/type/object constructor has changed
			// this will return true
			// thus signaling that we should replace the node
			return text || type || obj
		}

		// create element
		function createElement (node, component) {
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
					el.appendChild(createElement(child, component))
				})
			}

			// add refs
			// Component is only present
			// on the initial render
			// so this will only run once
			if (component) {
				var 
				props = node.props,
				ref   = props ? props.ref : __undefined

				// component has a ref add to parent component
				if (ref) {
					// if we have already set a refs object
					// use the same object
					component.refs = component.refs || {}

					// ref is a function run it
					// passing the el to it
					if (is(ref, __function)) {
						ref(el)
					}
					// add ref to component
					else if (is(ref, __string)) {
						component.refs[ref] = el
					}
				}
			}
		
			return el
		}

		// check if props is event
		function isEventProp (name, value) {
			// checks if the first two characters are on
			return name.substr(0,2) === 'on' && is(value, __function)
		}
		
		// get event name
		function extractEventName (name) {
			// removes the first two characters and converts to lowercase
			return name.substr(2, name[__length]).toLowerCase()
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

		function handlePropChanges (target, newNode, oldNode) {
			// get changes to props/attrs
			var
			propChanges = getPropChanges(
				target, 
				newNode.props, 
				oldNode.props
			)

			// if there are any prop changes,
			// update component props
			if (propChanges[__length]) {
				// before props change
				lifecycle(newNode, __componentWillUpdate, __true, __true)

				each(propChanges, function (obj) {
					updateProp(obj.target, obj.name, obj.value, obj.op)
				})

				// after props change
				lifecycle(newNode, __componentDidUpdate, __true, __true)
			}
		}
		
		// update props
		function getPropChanges (target, newProps, oldProps) {
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
		
		// initial creation of props, no checks, just set
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
				// value is an object
				// add each of it's properties to the
				// target elements attribute
				if (is(value, __object)) {
					// classes
					if (name === 'className' || name === 'class') {
						each(value, function (content, index) {
							// get what operation we will run
							// if the value is empty/false/undefined/null
							// we remove
							// if the values length is more than 0
							// or true or anything not of a falsy value
							// we add
							var 
							type = !content ? 'remove' : 'add'

							// add/remove class
							// target.classList[type](index)
							classList[type](target, index)
						})
					}
					// styles and other object type props
					else {
						each(value, function (content, index) {
							if (target[name][index] !== __undefined) {
								target[name][index] = content
							}
						})	
					}
				}
				else if (is(value, __array)) {
					if (name === 'className' || name === 'class') {
						target[name] = value.join(' ')
					}
				}
				else {
					target[name] = value
				}
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
	}


	/**
	 * server-side interface converts a hyperscript vdom object to html string
	 * @param {Object} hyperscript - hyperscript object
	 */
	function vdomToHTML (vdom) {
		// void elements that do not have a close </tag> 
		var
		element = {
			'area': __true,'base': __true,'br': __true,'!doctype': __true,
			'col': __true,'embed': __true,'wbr': __true,'track': __true,
			'hr': __true,'img': __true,'input': __true,'keygen': __true,
			'link': __true,'meta': __true,'param': __true,'source': __true
		}

		// print node
		function ToHTML (vdom, level) {
			// not a hyperscript object
			if (is(vdom, __string)) {
				return vdom
			}

			// references
			var 
			// i.e 'div'
			type = vdom.type,
			// i.e {id: 123, class: 'one two'}
			props = vdom.props,
			// i.e [obj, obj]
			children = vdom.children

			// print voidElements
			if (element[type]) {
				// <type ...props>
				return '<'+type+Props(props)+'>';
			}

			// otherwise...
			// <type ...props>...children</type>
			return '<'+type+Props(props)+'>' + Children(children, level) + '</'+type+'>'
		}

		// print props
		function Props (props) {
			props = __object.keys(props)
							// remove any falsey value
							.filter(function (name) {
								return  props[name] !== __undefined &&
										props[name] !== __null &&
										props[name] !== __false
							})
							// 
							.map(function (name) {
								// <type name="value">
								var 
								value = props[name]

								// don't add events, keys or refs
								if (!is(value, __function) && name !== 'key' && name !== 'ref') {
									// if the value is a falsey/truefy value
									// print just the name
									// i.e checkbox=true
									// will print <type checkbox>
									// otherwise <type value="">
									return value === __true ? name : name+'="'+value+'"'
								}
							})
							// create string, remove trailing space
							// <type ...props > => <type ...props>
							.join(' ').replace(/\s+$/g, '')

			// not empty?
			if (props) {
				return props
			}

			return ''
		}

		// print children
		function Children(children, level) {
			// empty
			if (children[__length] === 0) {
				return ''
			}

			// indent level
			level      = level || 0

			// print tabs
			var 
			indent     = '\t'.repeat(level + 1),
			lastIndent = '\t'.repeat(level)

			// iterate through and print each child
			return '\n'+indent+children.map(function (child) {
				return ToHTML(child, level + 1)
			}).join('\n'+indent)+'\n'+lastIndent
		}

		return ToHTML(vdom)
	}


	/**
	 * animate interface
	 * @return {Object} {flip, animate}
	 */
	function animate () {
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
					classList.toggle(element, className)
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
				classList.add(element, runningClass)
				classList.add(body, runningClass)

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

					classList.remove(element, runningClass)
					classList.remove(body, runningClass)

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
				classList.add(element, className)

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
				__setTimeout(function () {
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

		// classList helper
		classList = classList()

		return {
			flip: flip,
			transition: transition
		}
	}


	/**
	 * trust interface
	 * @param  {String} text - content to convert
	 */
	function trust (text) {
		function h () {
			this.type = 'p',
			this.props = {},
			this.children = [text]
		}

		h[__prototype].trust = __true,
		h[__prototype][__constructor] = __object

		return new h
	}


	/**
	 * DOM interface, creates html hyperscript functions to the global scope
	 * such that h('div', {}, 'Text') written as div({}, 'Text')
	 */
	function DOM () {
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
				var 
				args = __array[__prototype].slice.call(arguments),
				first = args[0]

				// i.e div('#id', {}, 'Children')
				if (
					is(first, __string) &&
					(
						first.substr(0,1) === '#' ||
						first.substr(0,1) === '.' ||
						first.substr(0,1) === '['
					)
				) {
					// name will now = 'div#id'
					name += first
					args.shift(first)
				}
				// add name as first arg
				// which represents the tag in hyperscript
				args.unshift(name)

				return h.apply(null, args)
			}
		})
	}


	/**
	 * router interface
	 * @param {Object}
	 * @example
	 * router({
	 * 		root: '/example',
	 * 		nav: '/user/id'
	 * 		routes: {
	 * 			'/:page/:name': () => {}
	 * 		}
	 * })
	 */
	function router (args) {
		function Router () {
			// references
			var
			self = this

			// data
			self.settings = {},
			self.url = __null,
			self.interval = __null,

			// history back
			self.back = function () {
				history.back()
			},
			// history foward
			self.foward = function () {
				history.foward()
			},
			// history go
			self.go = function (index) {
				history.go(index)
			},
			// navigate to a view
			self.nav = function (url) {
				var 
				root = this.settings.root
				
				url  = root ? root + url : url

				history.pushState(__null, __null, url)
			},
			// configure defualts
			self.config = function (obj) {
				var self = this;

				each(obj, function(value, name) {
					self.settings[name] = value
				})
			},
			// start listening for url changes
			self.init = function () {
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
			self.on = function (args) {
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
					var 
					root = self.settings.root,
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
						pattern:   root ? root + pattern : pattern,
						variables: variables
					}
				})
			},
			self.changed = function () {
				// references
				var 
				url    = this.url,
				routes = this.routes

				each(routes, function (val) {
					var 
					callback  = val.callback,
					pattern   = val.pattern,
					variables = val.variables,
					match

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
							callback(data, self.url)
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
		mount  = args.mount,
		root   = args.root,
		nav    = args.init,
		routes = args.routes,
		router = new Router

		if (mount) {
			router.config({mount: mount})
		}

		// define root address
		if (root) {
			router.config({root: root})
		}
		// assign routes
		if (routes) {
			router.on(routes)
		}

		// initialize listener
		router.init()

		// navigate to initial uri
		if (nav) {
			router.nav(nav)
		}

		// assign router to object
		return router
	}


	/**
	 * request interface
	 */
	function request () {
		/**
		 * http interface
		 * @param {String}
		 * @param {String}
		 * @param {Object}
		 * @param {Function}
		 */
		function http (url, method, data, callback) {
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
		 * @param  {Object}  obj   
		 * @param  {Object}  prefix
		 * @return {String}  serialized object
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
		 * promise interface
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

	    		__setTimeout(function () {
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
  		    		__setTimeout(function () {
  		      			throw err
  		    		}, 0)
  		  		})
	  		}

	  		fn(resolve, reject)
		}

		/**
		 * request interface
		 * @param {String}
		 * @param {Object}
		 * @param {Function}
		 */
		function request (method) {
			return function (url, data, callback) {
				if (is(data, __function)) {
					callback = data
				}

				// return ajax promise
				return http(url, method.toUpperCase(), data, callback)
			}
		}

		return {
			get: request('GET'),
			post: request('POST')
		}
	}

	/**
	 * render interface
	 * @return {Function}
	 * @example
	 * render = s.render(Component, '.selector')
	 * render()
	 */
	function render () {
		var
		component,
		newNode,
		oldNode,
		element,
		internal,
		initial = __true,
		args = __array[__prototype].slice.call(arguments)

		// assign args
		each(args, function (value) {
			// component (function)
			if (is(value, __function)) {
				component = value
			}
			// component (object)
			else if (is(value, __object)) {
				component = function () { return value }
			}
			// element
			else if (value.nodeType) {
				element = value
			}
			// element selector
			else if (is(value, __string)) {
				element = __document.querySelector(value)
			}
		})

		// has parent to mount to
		if (element) {
			// update
			function update (props, state) {
				// get a fresh copy of the vdom
				newNode = component(props, state)

				if (newNode) {
					debounce(function () {
						vdomToDOM(element, newNode, oldNode)
						// this newNode = the next renders oldNode
						oldNode = newNode
					})
				}
			}

			// initial mount
			function mount (props, state) {
				internal = component(__undefined, __undefined, __true)

				if (internal) {
					// get initial state if set
					if (internal[__getInitialState]) {
						setState(internal, internal[__getInitialState]())
						// remove method
						delete internal[__getInitialState]
					}
					// get default props if set
					if (internal[__getDefaultProps]) {
						setProps(internal, internal[__getDefaultProps]())
						// remove method
						delete internal[__getInitialState]
					}

					// reference render, we can then call this
					// in this.setState
					if (!internal['render()']) {
						internal['render()'] = update	
					}
				}
				// not a component or pure function that returns an object
				// throw error
				else {
					throw 'if you are using pure functions please make sure ' + 
						  'you return an object with a render method'
				}
				
				// not a component, convert to one
				// this means allows us to use pure functions
				// and just send them through render i.e
				// var render = s.render(() => {render: () => {return h('div')}}, '.app')
				if (!internal.setState) {
					component = comp(internal)
					internal  = component(__undefined, __undefined, __true)
				}

				// get a fresh copy of the vdom
				newNode = component(props, state)
				// clear dom
				element.innerHTML = ''

				if (newNode) {
					vdomToDOM(element, newNode, __undefined, internal)
					// this newNode = the next renders oldNode
					oldNode = newNode
					initial = __false
				}
			}

			// return function that runs update/mount when executed
			return function (props, state, forceUpdate, vdom) {
				// don't render to dom, if vdom is requested
				if (vdom) {
					return component(props, state)
				}
				else if (forceUpdate === 'html') {
					return component(props, state).toHTML()
				}
				

				// initial render
				if (initial || forceUpdate) {
					// mount and publish that the initial render has taken place
					mount(props, state)
				}
				// updates
				else {
					update(props, state)
				}

				return newNode
			}
		}
		// can't find element to mount to
		else {
			throw 'element to mount does not exist'
		}
	}


	/**
	 * component interface
	 */
	function Comp () {
		// immutable internal props & state
		this.props = {}
		this.state = {}
	}

	// set internal props & state
	Comp[__prototype] = {
		// i.e this.setState({})
		setState: function (obj) {
			setState(this, obj)
		},
		// i.e this.setProps({})
		setProps: function (obj) {
			setProps(this, obj)
		}
	}

	// create component
	function comp (obj) {
		// create new component object
		var component = new Comp

		// maybe the object is a function that returns an object
		if (is(obj, __function)) {
			obj = obj()
		}

		// add the properties to the component instance
		// also bind functions to the component scope
		each(obj, function (value, name) {
			if (is(value, __function)) {
				component[name] = value.bind(component)
			}
			else {
				component[name] = value
			}
		})

		// create a hyperscript object
		// that has a reference to the components instance
		// or internals
		function h (obj) {
			var 
			self = this

			self.type     = obj.type,
			self.props    = obj.props,
			self.children = obj.children
		}
		// prototype methods
		h[__prototype].internal = component
		h[__prototype].toHTML   = function () {
			return vdomToHTML(this)
		}

		// re-add default object constructor
		// insures obj.constructor will return Object
		h[__prototype][__constructor] = __object

		// reference the render function
		var
		render = component.render

		// return a function that when called
		// returns the components vdom representation
		// i.e User(props) -> {type: 'div', props: {..props}, children: ...}
		return function (props, state, internal) {
			// insure the render function returns the newly
			// created hyperscript object
			component.render = function (props, state) {
				return new h(render(props, state))
			}

			// publish componentWillReceiveProps lifecycle
			if (props) {
				lifecycle(component, __componentWillReceiveProps, __true, __undefined, __true)
			}

			// expose the components internals
			// when requested
			return internal ? component : component.render(props, state)
		}
	}

	// set component props
	function setProps (self, obj) {
		// assign props to {} if it's undefined
		self.props = self.props || {}

		if (obj) {
			// set props
			each(obj, function (value, name) {
				self.props[name] = value
			})
		}
	}

	// set component state
	function setState (self, obj) {
		// assign state to {} if it's undefined
		self.state = self.state || {}

		// if the object is a function that returns an object
		if (is(obj, __function)) {
			obj = obj()
		}

		// make sure we have something to update
		if (obj) {
			// set state
			each(obj, function (value, name) {
				self.state[name] = value
			})

			// update if this component is a render instance
			if (self['render()']) {
				self['render()'](self.props, self.state)
			}
		}
	}


	/**
	 * store interface
	 * @param  {[type]} reducer [description]
	 * @param {Number} range - timetravel/undo range
 	 * @return {Object} {connect, dispatch, getState, subscribe, timetravel}
	 */
	function store (reducer) {
		// if the reducer is an object of reducers (multiple)
		// lets combine the reducers
		if (is(reducer, __object)) {
			return create(combine(reducer))
		}
		// single reducer
		else {
			return create(reducer)
		}

		// combine reducers
		function combine (reducers) {
			return function (state, action) {
				state = state || {}

				return __object.keys(reducers).reduce(function (nextState, key) {
					nextState[key] = reducers[key](state[key], action)
					return nextState
				}, {})
			}
		}

		// create store
		function create (reducer) {
			var
			state,
			listeners = []

			// return the state
			function getState () {
				return state
			}

			// dispatch an action
			function dispatch (action, timetravel) {
				// there are no actions when we are time traveling
				if (!is(action, __object)) {
					throw 'action must be plain object'
				}
				if (action.type === __undefined) {
					throw 'actions must have a type'
				}

				// get state from reducer
				state = reducer(state, action)

				// dispatch to all listeners
				each(listeners, function (listener) {
					return listener(state)
				})
			}

			// subscribe to a store
			function subscribe (listener) {
				if (!is(listener, __function)) {
			  		throw 'listener should be a function'
				}

				listeners.push(listener)

				return function unsubscribe () {
					listener = listeners.filter(function (l) {
						return l !== listener
					})
				}
			}

			// auto subscribe a component to a store
			function connect (render, element) {
				render(getState())

				subscribe(function () {
					render(getState())
				})
			}

			dispatch({type: '@@surl/INIT'})

			return {
				getState: getState, 
				dispatch: dispatch, 
				subscribe: subscribe,
				connect: connect
			}
		}
	}


	/**
	 * two-way data binding, not to be confused with Function.bind
	 * @param  {String} props  - the property/attr to look for in the element
	 * @param  {Object} setter - the object to update/setter to execute
	 */
	function bind (props, setter) {
		function update (el, prop, setter) {
			// get key from element
			// either the prop is a property of the element object
			// or an attribute
			var
			value = (prop in el) ? el[prop] : el.getAttribute(prop)

			// just an <if(value)> doesn't work since the value can be false
			// null or undefined = prop/attr doesn't exist
			if (value !== __undefined && value !== __null) {
				// if the setter is a string
				// we use it to set the elements own properties
				if (is(setter, __string)) {
					(prop in el) ? el[prop] = value : el.setAttribute(prop, value)
				}
				else {
					// run the setter
					setter(value)
				}
			}
		}

		// the idea is that when you attach a function to an event,
		// i.e el.addEventListener('eventName', fn)
		// when that event is dispatched the function will execute
		// making the this context of this function the element 
		// that the event was attached to
		// we can then extract the value, and run the prop setter(value)
		// to change it's value
		return function () {
			// assign element
			var 
			el  = this

			// array of bindings
			if (is(props, __array)) {
				each(props, function(value, index) {
					update(el, value, setter[index])
				})
			}
			// singles
			else {
				update(el, props, setter)
			}
		}
	}


	/**
	 * props/getter,setter utility
	 * @param {Any} store - value
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


	/* --------------------------------------------------------------
	 * 
	 * Exports
	 * 
	 * -------------------------------------------------------------- */


	exports.h = element()
	exports.s = {
		animate: animate(),
		request: request(),
		render: render,
		router: router,
		store: store,
		trust: trust,
		prop: prop,
		bind: bind,
		DOM: DOM,
	}
}));