/*!dio 9.0.0-alpha.0 @license MIT */
;(function (window, __) {
	'use strict'

	/* eslint-disable */

	function factory (module, exports) {
		
		var dio = {version: '9.0.0-alpha.0'}
		
		var SharedElementPromise = 1
		var SharedElementFragment = 2
		var SharedElementPortal = 3
		var SharedElementSnapshot = 4
		var SharedElementComponent = 5
		var SharedElementCustom = 6
		var SharedElementNode = 7
		var SharedElementComment = 8
		var SharedElementText = 9
		var SharedElementEmpty = 10
		
		var SharedComponentForceUpdate = 1
		var SharedComponentPropsUpdate = 2
		var SharedComponentStateUpdate = 3
		
		var SharedRefsDispatch = 1
		var SharedRefsReplace = 2
		var SharedRefsRemove = 3
		var SharedRefsAssign = 4
		
		var SharedPropsMount = 1
		var SharedPropsUpdate = 2
		
		var SharedMountQuery = 1
		var SharedMountOwner = 2
		
		var SharedOwnerAppend = 4
		var SharedOwnerInsert = 5
		
		var SharedUnmountElement = 1
		var SharedUnmountChildren = 2
		
		var SharedWorkIdle = 1
		var SharedWorkUpdating = 2
		
		var SharedKeyHead = '&|head|'
		var SharedKeyBody = '&|body|'
		var SharedKeyTail = '&|tail|'
		
		var SharedLocalNameComment = '#comment'
		var SharedLocalNameEmpty = '#empty'
		var SharedLocalNameText = '#text'
		
		var SharedLinkedPrevious = 'prev'
		var SharedLinkedNext = 'next'
		
		var SharedSiteEvent = 'event'
		var SharedSitePromise = 'promise'
		var SharedSitePrototype = 'prototype'
		var SharedSiteCallback = 'callback'
		var SharedSiteRender = 'render'
		var SharedSiteElement = 'element'
		var SharedSiteConstructor = 'constructor'
		var SharedSiteForceUpdate = 'forceUpdate'
		var SharedSiteSetState = 'setState'
		var SharedSiteFindDOMNode = 'findDOMNode'
		var SharedSiteDisplayName = 'displayName'
		
		var SharedComponentWillMount = 'componentWillMount'
		var SharedComponentDidMount = 'componentDidMount'
		var SharedComponentWillReceiveProps = 'componentWillReceiveProps'
		var SharedComponentShouldUpdate = 'shouldComponentUpdate'
		var SharedComponentWillUpdate = 'componentWillUpdate'
		var SharedComponentDidUpdate = 'componentDidUpdate'
		var SharedComponentWillUnmount = 'componentWillUnmount'
		var SharedComponentDidCatch = 'componentDidCatch'
		var SharedGetChildContext = 'getChildContext'
		var SharedGetInitialState = 'getInitialState'
		var SharedGetDefaultProps = 'getDefaultProps'
		var SharedDefaultProps = 'defaultProps'
		
		var WeakMap = window.WeakMap || WeakHash
		var Symbol = window.Symbol || Math.random
		var isArray = Array.isArray
		
		var objectDefineProperties = Object.defineProperties
		var objectDefineProperty = Object.defineProperty
		var objectHasOwnProperty = Object.hasOwnProperty
		var objectCreate = Object.create
		var objectKeys = Object.keys
		
		var SymbolFor = Symbol.for || hash
		var SymbolCache = SymbolFor('dio.Cache')
		var SymbolState = SymbolFor('dio.State')
		var SymbolElement = SymbolFor('dio.Element')
		var SymbolFragment = SymbolFor('dio.Fragment')
		var SymbolComponent = SymbolFor('dio.Component')
		var SymbolException = SymbolFor('dio.Exception')
		var SymbolIterator = Symbol.iterator || '@@iterator'
		var SymbolAsyncIterator = Symbol.asyncIterator || '@@asyncIterator'
		
		var uuid = 2147483647
		var seed = 4022871197 % uuid
		
		/**
		 * @constructor
		 */
		function List () {
			this.next = this
			this.prev = this
			this.length = 0
		}
		/**
		 * @type {object}
		 */
		objectDefineProperties(objectDefineProperty(List[SharedSitePrototype], SymbolIterator, {value: noop}), {
			/**
			 * @param {object} node
			 * @param {object} before
			 * @return {object}
			 */
			insert: {
				value: function insert (node, before) {
					node.next = before
					node.prev = before.prev
		
					before.prev.next = node
					before.prev = node
		
					this.length++
		
					return node
				}
			},
			/**
			 * @param {object} node
			 * @return {object}
			 */
			remove: {
					value: function remove (node) {
					if (this.length === 0)
						return node
		
					node.next.prev = node.prev
					node.prev.next = node.next
		
					this.length--
		
					return node
				}
			},
			/**
			 * @param {function} callback
			 */
			forEach: {
					value: function forEach (callback) {
					for (var node = this, length = node.length; length > 0; --length)
						callback(node = node.next)
				}
			}
		})
		
		/**
		 * @constructor
		 */
		function WeakHash () {
			this.hash = Symbol()
		}
		/**
		 * @type {object}
		 */
		objectDefineProperties(WeakHash[SharedSitePrototype], {
			/**
			 * @param {*} key
			 * @param {*} value
			 */
			set: {
				value: function set (key, value ) {
					key[this.hash] = value
			}},
			/**
			 * @param {*} key
			 * @return {*}
			 */
			get: {
				value: function get (key) {
					return key[this.hash]
			}},
			/**
			 * @param {*} key
			 * @return {boolean}
			 */
			has: {
				value: function has (key) {
					return this.hash in key
				}
			}
		})
		
		/**
		 * @return {void}
		 */
		function noop () {}
		
		/**
		 * @param {object} object
		 * @param {object} primary
		 */
		function merge (object, primary) {
			for (var key in primary)
				object[key] = primary[key]
		
			return object
		}
		
		/**
		 * @param {object} object
		 * @param {object} primary
		 * @param {object} secondary
		 * @return {object}
		 */
		function assign (object, primary, secondary) {
			for (var key in primary)
				object[key] = primary[key]
		
			for (var key in secondary)
				object[key] = secondary[key]
		
			return object
		}
		
		/**
		 * @param {Array} array
		 * @param {Array} output
		 * @return {Array}
		 */
		function flatten (array, output) {
			for (var i = 0; i < array.length; ++i)
				isArray(array[i]) ? flatten(array[i], output) : output.push(array[i])
		
			return output
		}
		
		/**
		 * @param {Array} haystack
		 * @param {function} callback
		 * @param {*} thisArg
		 */
		function find (haystack, callback, thisArg) {
			if (typeof haystack.find === 'function')
				return haystack.find(callback, thisArg)
		
		  for (var i = 0; i < haystack.length; ++i)
		  	if (callback.call(thisArg, haystack[i], i, haystack))
		  		return haystack[i]
		}
		
		/**
		 * @param {Iterable} iterable
		 * @param {function} callback
		 */
		function each (iterable, callback) {
			if (typeof iterable.forEach === 'function')
				return iterable.forEach(callback)
		
			var index = 0
			var value = iterable.next(value, index++)
		
			while (!value.done)
				value = iterable.next(value.value, index = callback(value.value, index))
		}
		
		/**
		 * @param {string} from
		 * @param {string} message
		 */
		function invariant (from, message) {
			throw new Error('#'+from+'(...): '+message+'.')
		}
		
		/**
		 * @param {object} a
		 * @param {object} b
		 * @return {boolean}
		 */
		function compare (a, b) {
			for (var key in a)
				if (!objectHasOwnProperty.call(b, key))
					return true
		
			for (var key in b)
				if (!is(a[key], b[key]))
					return true
		
			return false
		}
		
		/**
		 * @param {*} a
		 * @param {*} b
		 * @return {boolean}
		 */
		function is (a, b) {
			if (a === b)
				return a !== 0 || 1/a === 1/b
		
			return a !== a && b !== b
		}
		
		/**
		 * @param {string} str
		 * @return {number}
		 */
		function hash (str) {
			for (var i = 0, code = 0; i < str.length; ++i)
				code = ((code << 5) - code) + str.charCodeAt(i)
		
			return code >>> 0
		}
		
		/**
		 * @return {boolean}
		 */
		function fetchable (object) {
			return (
				typeof object.blob === 'function' &&
				typeof object.text === 'function' &&
				typeof object.json === 'function'
			)
		}
		
		/**
		 * @param {object} object
		 * @return {boolean}
		 */
		function thenable (object) {
			return typeof object.then === 'function' && typeof object.catch === 'function'
		}
		
		/**
		 * @param {string} prefix
		 * @return {string}
		 */
		function random (prefix) {
			return prefix + '.' + (((seed = seed * 16807 % uuid - 1) - 1) / uuid).toString(36).substring(2)
		}
		
		/**
		 * @constructor
		 * @param {number} id
		 */
		function Element (id) {
			this.id = id
			this.active = false
			this.work = SharedWorkIdle
			this.xmlns = null
			this.key = null
			this.ref = null
			this.type = null
			this.props = null
			this.cache = null
			this.children = null
			this.owner = null
			this.context = null
			this.parent = null
			this.host = null
			this.next = null
			this.prev = null
		}
		/**
		 * @type {object}
		 */
		objectDefineProperties(objectDefineProperty(Element[SharedSitePrototype], SymbolIterator, {value: noop}), {
		 	constructor: {value: SymbolElement},
		 	handleEvent: {value: handleEvent}
		})
		
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		function createElementImmutable (snapshot) {
			var element = new Element(snapshot.id)
			var children = snapshot.children
		
			if (typeof children === 'object' && snapshot.id !== SharedElementComponent)
				children = createElementImmutableChildren(children)
		
			element.type = snapshot.type
			element.props = snapshot.props
			element.xmlns = snapshot.xmlns
			element.key = snapshot.key
			element.ref = snapshot.ref
			element.children = children
		
			return element
		}
		
		/**
		 * @param {List} iterable
		 * @return {List}
		 */
		function createElementImmutableChildren (iterable) {
			for (var children = new List(), element = iterable, length = element.length; length > 0; --length)
				children.insert(createElementImmutable(element = element.next), children)
		
			return children
		}
		
		/**
		 * @param {Element} snapshot
		 * @return {Element}
		 */
		function createElementSnapshot (snapshot) {
			var element = new Element(SharedElementSnapshot)
		
			element.children = snapshot
		
			return element
		}
		
		/**
		 * @param {(string|number)} content
		 * @param {*} key
		 * @return {Element}
		 */
		function createElementText (content, key) {
			var element = new Element(SharedElementText)
		
			element.type = SharedLocalNameText
			element.key = SharedKeyBody + key
			element.children = content + ''
		
			return element
		}
		
		/**
		 * @param {*} key
		 * @return {Element}
		 */
		function createElementEmpty (key) {
			var element = new Element(SharedElementEmpty)
		
			element.type = SharedLocalNameEmpty
			element.key = SharedKeyBody + key
			element.children = ''
		
			return element
		}
		
		/**
		 * @param {function} callback
		 * @return {Element}
		 */
		function createElementPromise (callback) {
			return createElement({then: callback, catch: noop})
		}
		
		/**
		 * @param {Element} element
		 * @param {object} generator
		 * @return {Element}
		 */
		function createElementGenerator (element, generator) {
			return (element.type.then = enqueueComponentGenerator(element, generator)) && element
		}
		
		/**
		 * @param {(Element|Array)} iterable
		 * @return {Element}
		 */
		function createElementFragment (iterable) {
			var element = new Element(SharedElementFragment)
		
			element.type = SymbolFragment
			element.children = createElementChildren(iterable)
		
			return element
		}
		
		/**
		 * @param {function} type
		 * @param {object} props
		 * @param {*} children
		 * @return {Element}
		 */
		function createElementComponent (type, props, children) {
			var element = new Element(SharedElementCustom)
		
			element.type = type
			element.props = props
			element.children = createElementChildren(children)
		
			return element
		}
		
		/**
		 * @param {*} type
		 * @param {object} props
		 * @param {Array} config
		 * @return {List}
		 */
		function createElementClone (type, props, config) {
			var element = createElement.apply(null, [type].concat(config))
		
			getElementProps(element, element.props = assign({}, props, element.props))
		
			return element
		}
		
		/**
		 * @param {object} iterable
		 * @return {List}
		 */
		function createElementChildren (iterable) {
			var children = new List()
		
			if (isArray(iterable))
				for (var i = 0; i < iterable.length; ++i)
					getElementChildren(children, iterable[i], i)
			else
				getElementChildren(children, iterable, 0)
		
			createElementBoundary(children)
		
			return children
		}
		
		/**
		 * @param {*} element
		 * @param {*} key
		 * @return {Element?}
		 */
		function createElementUnknown (element, key) {
			switch (typeof element) {
				case 'boolean':
					return createElementEmpty(key)
				case 'object':
					if (typeof element[SymbolIterator] === 'function')
						return createElementFragment(arrayChildren(element))
		
					if (typeof element[SymbolAsyncIterator] === 'function')
						return createElementGenerator(createElementPromise(noop), element)
		
					if (!thenable(element))
						break
				case 'function':
					return createElement(element)
			}
		
			invariant(SharedSiteRender, 'Invalid element [object ' + getDisplayName(element) + ']')
		}
		
		/**
		 * @param {List} children
		 */
		function createElementBoundary (children) {
			children.insert(createElementEmpty(SharedKeyHead), children.next)
			children.insert(createElementEmpty(SharedKeyTail), children)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} snapshot
		 * @param {List} children
		 */
		function replaceElementChildren (element, snapshot, children) {
			children.insert(snapshot, element)
			children.remove(element)
		}
		
		/**
		 * @param {List} children
		 * @param {*} element
		 * @param {number} index
		 * @param {number}
		 */
		function getElementChildren (children, element, index) {
			if (element != null) {
				if (element.constructor === SymbolElement) {
					if (element.key === null)
						element.key = SharedKeyBody + index
		
					children.insert(element.next === null ? element : createElementImmutable(element), children)
				} else {
					switch (typeof element) {
						case 'string':
						case 'number':
							children.insert(createElementText(element, index), children)
							break
						case 'object':
							if (isArray(element)) {
								for (var i = 0; i < element.length; ++i)
									getElementChildren(children, element[i], index + i)
		
								return index + i
							}
						default:
							return getElementChildren(children, createElementUnknown(element, index), index)
					}
				}
			} else {
				children.insert(createElementEmpty(index), children)
			}
		
			return index + 1
		}
		
		/**
		 * @param {Element} element
		 * @param {*} props
		 */
		function getElementProps (element, props) {
			if (props.key !== undefined)
				element.key = props.key
		
			if (props.ref !== undefined)
				element.ref = props.ref
		
			if (props.xmlns !== undefined)
				element.xmlns = props.xmlns
		}
		
		/**
		 * @param {Element} element
		 * @param {function} type
		 * @param {object} props
		 * @return {object}
		 */
		function getDefaultProps (element, type, props) {
			return typeof type[SharedDefaultProps] === 'function' ? type[SharedDefaultProps](props) : type[SharedDefaultProps]
		}
		
		/**
		 * @param {*} value
		 * @return {string}
		 */
		function getDisplayName (value) {
			switch (typeof value) {
				case 'number':
				case 'symbol':
					return getDisplayName(value.toString())
				case 'function':
					return getDisplayName(value[SharedSiteDisplayName] || value.name)
				case 'object':
					if (isValidElement(value))
						return getDisplayName(value.type)
		
					if (thenable(value))
						return '#promise'
				case 'string':
					if (value)
						return value
				default:
					return '#anonymous'
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @param {string} direction
		 * @return {Element}
		 */
		function getElementSibling (element, parent, direction) {
			if (isValidElement(element[direction]))
				if (element[direction].id === SharedElementPortal)
					return getElementSibling(element[direction], parent, direction)
				else
					return element[direction]
		
			if (element.host && element.host.children === element)
				return getElementSibling(element.host, parent, direction)
		
			if (parent.id < SharedElementSnapshot)
				return getElementSibling(parent, parent.parent, direction)
		
			return createElementSnapshot(element)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element}
		 */
		function getElementParent (element) {
			return element.id < SharedElementPortal ? getElementParent(element.parent) : element
		}
		
		/**
		 * @param {Element} element
		 * @param {string} direction
		 * @return {Element}
		 */
		function getElementBoundary (element, direction) {
			return element.id < SharedElementSnapshot ? getElementBoundary(element.children[direction]) : element
		}
		
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		function getElementDescription (element) {
			return element.id === SharedElementComponent ? getElementDescription(element.children) : element
		}
		
		/**
		 * @param {*} element
		 * @return {Element}
		 */
		function getElementDefinition (element) {
			if (element == null)
				return createElementEmpty(SharedKeyBody)
		
			if (element.constructor === SymbolElement)
				return element
		
			switch (typeof element) {
				case 'string':
				case 'number':
					return createElementText(element, SharedKeyBody)
				case 'object':
					if (isArray(element))
						return createElementFragment(element)
				default:
					return createElementUnknown(element, SharedKeyBody)
			}
		}
		
		/**
		 * @param {*} element
		 * @return {Element}
		 */
		function getElementModule (element) {
			if (!isValidElement(element) && objectHasOwnProperty.call(Object(element), 'default'))
				return getElementModule(element.default)
		
			return createElementFragment(getElementDefinition(element))
		}
		
		/**
		 * @param {(Element|Array)} children
		 * @param {object} container
		 * @param {(string|number|symbol)?} key
		 * @return {Element}
		 */
		function createPortal (children, container, key) {
			var element = new Element(SharedElementPortal)
		
			element.type = container
			element.key = key === undefined ? null : key
			element.children = createElementChildren(children)
		
			return element
		}
		
		/**
		 * @param {(string|number)} content
		 * @param {(string|number|Symbol)?} key
		 * @return {Element}
		 */
		function createComment (content, key) {
			var element = new Element(SharedElementComment)
		
			element.type = SharedLocalNameComment
			element.key = key === undefined ? null : key
			element.children = content + ''
		
			return element
		}
		
		/**
		 * @param {*} type
		 * @param {*?} config
		 * @param {...*}
		 * @return {Element}
		 */
		function createElement (type, config) {
			var i = config != null ? 1 : 2
			var size = 0
			var index = 0
			var id = typeof type !== 'function' ? SharedElementNode : SharedElementComponent
			var length = arguments.length
			var element = new Element(id)
			var props = {}
			var children = element.children = id !== SharedElementComponent ? new List() : undefined
		
			if (i === 1 && typeof config === 'object' && config[SymbolIterator] === undefined) {
				switch (config.constructor) {
					default:
						if (isArray(config))
							break
					case Object:
						if (thenable(config))
							break
		
						getElementProps(element, (++i, props = config))
		
						if (props.children !== undefined && id !== SharedElementComponent)
							length - i < 1 ? index = getElementChildren(children, props.children, index) : 0
				}
			}
		
			if ((size = length - i) > 0)
				if (id !== SharedElementComponent) {
					for (; i < length; ++i)
						index = getElementChildren(children, arguments[i], index)
				} else {
					if (size === 1)
						children = arguments[i]
					else for (children = []; i < length; ++i)
						children.push(arguments[i])
		
					props.children = children
				}
		
			switch (typeof type) {
				case 'function':
					if (type[SharedDefaultProps])
						props = assign({}, getDefaultProps(element, type, props), props)
					break
				case 'number':
				case 'symbol':
					if (type === SymbolFragment)
						createElementBoundary((element.id = SharedElementFragment, children))
					break
				default:
					if (thenable(type))
						createElementBoundary((element.id = SharedElementPromise, children))
			}
		
			element.type = type
			element.props = props
		
			return element
		}
		
		/**
		 * @param {Element} element
		 * @param {...*}
		 * @return {Element?}
		 */
		function cloneElement (element) {
			if (isValidElement(element))
				return createElementClone(element.type, element.props, [].slice.call(arguments, 1))
		}
		
		/**
		 * @param {Element} element
		 * @return {boolean}
		 */
		function isValidElement (element) {
			return element != null && element.constructor === SymbolElement
		}
		
		/**
		 * @type {object}
		 */
		var Children = {
			toArray: arrayChildren,
			forEach: eachChildren,
			map: mapChildren,
			filter: filterChildren,
			find: findChildren,
			count: countChildren,
			only: onlyChildren
		}
		
		/**
		 * @param {*} children
		 * @return {Array}
		 */
		function arrayChildren (children) {
			var array = []
		
			if (children == null)
				return array
			if (isValidElement(children) || typeof children !== 'object')
				return [children]
			if (isArray(children))
				return flatten(children, array)
			if (typeof children[SharedLinkedNext] === 'function' || typeof children.forEach === 'function')
				each(children, function (element) {
					return array.push(element)
				})
			else if (typeof children[SymbolIterator] === 'function')
				return arrayChildren(children[SymbolIterator]())
			else
				array.push(children)
		
			return flatten(array, [])
		}
		
		/**
		 * @param {*} children
		 * @param {function} callback
		 * @param {*} thisArg
		 */
		function eachChildren (children, callback, thisArg) {
			if (children != null)
				arrayChildren(children).forEach(callback, thisArg)
		}
		
		/**
		 * @param {*} children
		 * @param {function} callback
		 * @return {Array}
		 */
		function mapChildren (children, callback, thisArg) {
			return children != null ? arrayChildren(children).map(callback, thisArg) : children
		}
		
		/**
		 * @param {*} children
		 * @param {function} callback
		 * @param {*} thisArg
		 */
		function filterChildren (children, callback, thisArg) {
			return children != null ? arrayChildren(children).filter(callback, thisArg) : children
		}
		
		/**
		 * @param {*} children
		 * @param {function} callback
		 * @param {*} thisArg
		 */
		function findChildren (children, callback, thisArg) {
			return children != null ? find(arrayChildren(children), callback, thisArg) : children
		}
		
		/**
		 * @param {*} children
		 * @return {number}
		 */
		function countChildren (children) {
			return arrayChildren(children).length
		}
		
		/**
		 * @param {*} children
		 * @return {Element?}
		 */
		function onlyChildren (children) {
			return isValidElement(children) ? children : invariant('Children.only', 'Expected to receive a single element')
		}
		
		/**
		 * @param {string|function|object|Element} type
		 * @return {function|object}
		 */
		function createFactory (type) {
			if (type !== null && typeof type === 'object' && !isValidElement(type))
				return factory(module, type)
		
			return createElement.bind(null, type)
		}
		
		/**
		 * @param {string} type
		 * @param {function} value
		 * @return {function}
		 */
		function getFactory (type, value) {
			if (!exports)
				return value
		
			if (typeof exports[type] === 'function')
				return exports[type].bind(exports)
		
			return exports[type] = value
		}
		
		/**
		 * @constructor
		 * @param {Element} element
		 * @param {*} err
		 * @param {string} origin
		 */
		function Exception (element, err, origin) {
			this.error = err
			this.origin = origin
			this.bubbles = true
			this[SymbolElement] = element
		}
		/**
		 * @type {object}
		 */
		objectDefineProperties(Exception[SharedSitePrototype], {
			toString: {
				value: function () {
					return 'Error: ' + Object(this.error).toString() + '\n\n' + this.message
				}
			},
			message: {
				get: function () {
					return 'The following error occurred in `\n' + this.componentStack + '` from "' + this.origin + '"'
				}
			},
			componentStack: {
				get: function () {
					return this[SymbolComponent] = this[SymbolComponent] ? this[SymbolComponent] : (
						createErrorStack(this[SymbolElement].host, '<'+getDisplayName(this[SymbolElement])+'>\n')
					)
				}
			}
		})
		
		/**
		 * @param {Element} element
		 * @param {*} err
		 * @param {string} origin
		 */
		function createErrorException (element, err, origin) {
			return new Exception(element, err, origin)
		}
		
		/**
		 * @throws Exception
		 * @param {Element} element
		 * @param {*} err
		 * @param {string} origin
		 */
		function throwErrorException (element, err, origin) {
			throw createErrorException(element, err, origin)
		}
		
		/**
		 * @throws
		 * @param {Element} element
		 * @param {*} err
		 * @param {string} origin
		 */
		function reportErrorException (element, err, origin) {
			throw printErrorException(createErrorException(element, err, origin))
		}
		
		/**
		 * @param {(object|string)} exception
		 * @return {*}
		 */
		function printErrorException (exception) {
			try {
				console.error(exception.toString())
			} catch (err) {} finally {
				return exception.error
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} stack
		 * @return {string}
		 */
		function createErrorStack (host, stack) {
			return host && host.host ? stack + createErrorStack(host.host, '<' + getDisplayName(host) + '>\n') : stack
		}
		
		/**
		 * @param {Element} element
		 */
		function clearErrorBoundary (element) {
			reconcileElement(element.children, getElementDefinition(), element)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} host
		 * @param {Element} parent
		 * @param {Exception} exception
		 */
		function replaceErrorBoundary (element, host, parent, exception) {
			commitUnmountElement(element, parent)
			delegateErrorBoundary(element, host, exception)
		}
		
		/**
		 * @param {Element} element
		 * @param {*} err
		 * @param {string} origin
		 */
		function invokeErrorBoundary (element, err, origin) {
			propagateErrorBoundary(element, element, element.host, createErrorException(element, err, origin))
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} host
		 * @param {Exception} exception
		 */
		function delegateErrorBoundary (element, host, exception) {
			propagateErrorBoundary(element, host, host, exception)
		}
		
		/**
		 * @param {Element} element
		 * @param {Exception} exception
		 * @param {Component} owner
		 */
		function catchErrorBoundary (element, exception, owner) {
			if (owner && owner[SharedComponentDidCatch] && !owner[SymbolException])
				owner[SymbolException] = getLifecycleBoundary(element, owner, owner[SymbolException] = exception)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} host
		 * @param {Element} parent
		 * @param {Exception} exception
		 */
		function propagateErrorBoundary (element, host, parent, exception) {
			clearErrorBoundary(parent)
			catchErrorBoundary(parent, exception, parent.owner)
		
			if (!exception.bubbles)
				return
		
			if (!isValidElement(parent.host))
				throw printErrorException(exception)
		
			if (element !== host)
				throw exception
		
			propagateErrorBoundary(element, host, parent.host, exception)
		}
		
		/**
		 * @param {Event}
		 */
		function handleEvent (event) {
			try {
				var element = this
				var callback = getNodeListener(element, event)
				var host = element.host
				var owner = host.owner
				var props = owner.props
				var state = owner.state
				var context = owner.context
				var value
		
				if (!callback)
					return
		
				if (typeof callback === 'function') {
					value = callback.call(owner, event, props, state, context)
				} else if (typeof callback.handleEvent === 'function') {
					if (owner !== callback && callback[SymbolComponent])
						host = (owner = callback)[SymbolElement]
		
					value = callback.handleEvent(event, props, state, context)
				}
		
				if (value && owner[SymbolComponent])
					enqueueComponentValue(host, SharedSiteEvent, value)
			} catch (err) {
				reportErrorException(host, err, SharedSiteEvent+':'+getDisplayName(callback.handleEvent || callback))
			}
		}
		
		/**
		 * @constructor
		 * @param {object} props
		 * @param {object} context
		 */
		function Component (props, context) {
			this.refs = {}
			this.state = {}
			this.props = props
			this.context = context
		}
		/**
		 * @type {object}
		 */
		Component[SharedSitePrototype] = createComponentPrototype(Component[SharedSitePrototype])
		
		/**
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 */
		function PureComponent (props, context) {
			Component.call(this, props, context)
		}
		/**
		 * @type {object}
		 */
		PureComponent[SharedSitePrototype] = objectCreate(Component[SharedSitePrototype], {
			shouldComponentUpdate: {value: shouldComponentUpdate}
		})
		
		/**
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 */
		function CustomComponent (props, context) {
			Component.call(this, props, context)
		}
		/**
		 * @type {object}
		 */
		CustomComponent[SharedSitePrototype] = objectCreate(Component[SharedSitePrototype], {
			render: {
				value: function () {
					return createElementComponent(this[SymbolElement].type, this.props, this.props.children)
				}
			}
		})
		
		/**
		 * @param {object} props
		 * @param {object} state
		 * @return {boolean}
		 */
		function shouldComponentUpdate (props, state) {
			return compare(this.props, props) || compare(this.state, state)
		}
		
		/**
		 * @param {(Object|function)} state
		 * @param {function?} callback
		 */
		function setState (state, callback) {
			enqueueComponentUpdate(this[SymbolElement], this, state, SharedComponentStateUpdate, callback)
		}
		
		/**
		 * @param {function} callback
		 */
		function forceUpdate (callback) {
			enqueueComponentUpdate(this[SymbolElement], this, {}, SharedComponentForceUpdate, callback)
		}
		
		/**
		 * @param {object} description
		 * @return {function}
		 */
		function createClass (description) {
			return createComponentClass(Object(description), function constructor (props, context) {
				for (var i = 0, keys = objectKeys(constructor[SharedSitePrototype]); i < keys.length; ++i)
					this[keys[i]] = this[keys[i]].bind(this)
			})
		}
		
		/**
		 * @param {object} description
		 * @param {function} constructor
		 * @return {function}
		 */
		function createComponentClass (description, constructor) {
			if (description[SymbolComponent])
				return description[SymbolComponent]
		
			if (typeof description === 'function' && !description[SharedSiteRender])
				return createComponentClass(description[SharedSiteRender] = description, constructor)
		
			if (description[SharedSiteDisplayName])
				constructor[SharedSiteDisplayName] = description[SharedSiteDisplayName]
		
			if (description[SharedGetDefaultProps])
				constructor[SharedDefaultProps] = description[SharedGetDefaultProps]
		
			for (var name in description)
				description[name] = getComponentDescriptor(name, description[name])
		
			constructor[SharedSitePrototype] = objectCreate(Component[SharedSitePrototype], description)
		
			return description[SymbolComponent] = constructor
		}
		
		/**
		 * @param {object} prototype
		 * @return {object}
		 */
		function createComponentPrototype (prototype) {
			objectDefineProperty(prototype, SymbolComponent, {value: SymbolComponent})
			objectDefineProperty(prototype, SharedSiteSetState, {value: setState})
			objectDefineProperty(prototype, SharedSiteForceUpdate, {value: forceUpdate})
		
			if (!prototype[SharedSiteRender])
				objectDefineProperty(prototype, SharedSiteRender, getComponentDescriptor(SharedSiteRender, noop))
		
			return prototype
		}
		
		/**
		 * @param {function} type
		 * @return {function}
		 */
		function getComponentClass (type) {
			if (!type[SharedSitePrototype] || !type[SharedSitePrototype][SharedSiteRender])
				return type[SymbolComponent] || (isValidNodeComponent(type) ? CustomComponent : createComponentClass(type, function () {}))
		
			if (!type[SharedSitePrototype][SymbolComponent])
				createComponentPrototype(type[SharedSitePrototype])
		
			return type
		}
		
		/**
		 * @param {string} name
		 * @param {*} value
		 * @return {object}
		 */
		function getComponentDescriptor (name, value) {
			switch (name) {
				case SharedComponentWillMount:
				case SharedComponentDidMount:
				case SharedComponentWillReceiveProps:
				case SharedComponentShouldUpdate:
				case SharedComponentWillUpdate:
				case SharedComponentDidUpdate:
				case SharedComponentWillUnmount:
				case SharedComponentDidCatch:
				case SharedGetDefaultProps:
				case SharedGetChildContext:
				case SharedGetInitialState:
				case SharedSiteConstructor:
				case SharedSiteDisplayName:
				case SharedSiteRender:
					return {value: value, writable: true, configurable: true, enumerable: false}
				default:
					return {value: value, writable: true, configurable: true, enumerable: typeof value === 'function'}
			}
		}
		
		/**
		 * @param {(Component|object)?} value
		 * @param {*} key
		 * @param {Element} element
		 */
		function getComponentReference (value, key, element) {
			if (key !== element.ref)
				delete this.refs[element.ref]
		
			this.refs[key] = value
		}
		
		/**
		 * @param {Element} element
		 * @return {Element}
		 */
		function mountComponentInstance (element) {
			var children = element
			var props = element.props
			var host = element.host
			var context = element.context = host.context || getNodeContext(element)
			var owner = getLifecycleInstance(element, getComponentClass(element.type), props, context)
			var state = owner.state = owner.state || {}
		
			owner.props = props
			owner.context = context
			owner.refs = owner.refs || {}
			owner[SymbolState] = owner[SymbolCache] = {}
			owner[SymbolElement] = element
		
			if (owner[SharedGetInitialState])
				owner.state = getLifecycleUpdate(element, SharedGetInitialState, props, state, context) || state
		
			if (owner[SharedComponentWillMount])
				getLifecycleUpdate(element, SharedComponentWillMount, props, state, context)
		
			if (thenable(state = owner.state))
				children = createElementPromise(enqueueComponentInitialState(element, owner, state))
			else
				children = getLifecycleRender(element, owner)
		
			if (owner[SharedGetChildContext])
				element.context = assign({}, context, getLifecycleUpdate(element, SharedGetChildContext, props, state, context))
		
			return element.children = children
		}
		
		/**
		 * @param {Element} element
		 * @return {Promise?}
		 */
		function unmountComponentInstance (element) {
			if (element.owner[SharedComponentWillUnmount])
				if (element.cache = getLifecycleUnmount(element, SharedComponentWillUnmount))
					if (thenable(element.cache))
						return element.cache.catch(function (err) {
							invokeErrorBoundary(element, err, SharedComponentWillUnmount)
						})
		
			element.cache = null
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} snapshot
		 * @param {Element} host
		 * @param {number} signature
		 */
		function updateComponentElement (element, snapshot, host, signature) {
			try {
				updateComponentChildren(element, snapshot, signature)
			} catch (err) {
				delegateErrorBoundary(element, host, err)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} snapshot
		 * @param {number} signature
		 */
		function updateComponentChildren (element, snapshot, signature) {
			var owner = element.owner
			var prevProps = element.props
			var nextProps = snapshot.props
			var nextContext = owner.context
			var prevState = owner.state
			var tempState = owner[SymbolState] = owner[SymbolCache]
			var nextState = prevState
		
			switch (signature) {
				case SharedComponentPropsUpdate:
					if (owner[SharedComponentWillReceiveProps])
						getLifecycleUpdate(element, SharedComponentWillReceiveProps, nextProps, nextContext)
		
					if (tempState !== owner[SymbolCache])
						break
				case SharedComponentForceUpdate:
					tempState = nextState
			}
		
			nextState = owner[SymbolState] = tempState !== nextState ? assign({}, prevState, tempState) : nextState
		
			if (signature !== SharedComponentForceUpdate)
				if (owner[SharedComponentShouldUpdate])
					if (!getLifecycleUpdate(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext))
						return
		
			if (owner[SharedComponentWillUpdate])
				getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)
		
			if (owner[SharedGetChildContext])
				merge(element.context, getLifecycleUpdate(element, SharedGetChildContext, nextProps, nextState, nextContext))
		
			switch (signature) {
				case SharedComponentPropsUpdate:
					owner.props = element.props = nextProps
				case SharedComponentStateUpdate:
					owner.state = nextState
			}
		
			reconcileElement(element.children, getLifecycleRender(element, owner), element)
		
			if (owner[SharedComponentDidUpdate])
				getLifecycleUpdate(element, SharedComponentDidUpdate, prevProps, prevState, nextContext)
		
			if (element.ref !== snapshot.ref)
				commitOwnerRefs(element, snapshot.ref, SharedRefsReplace)
		}
		
		/**
		 * @param {Element} element
		 * @param {Component} owner
		 * @param {object} state
		 * @return {function}
		 */
		function enqueueComponentInitialState (element, owner, state) {
			return function then (resolve, reject) {
				enqueueStatePromise(element, owner, state, SharedComponentStateUpdate, function () {
					if (owner[SymbolException])
						reject(owner[SymbolException])
					else
						resolve(element.children.type.then === then && getLifecycleRender(element, owner))
				})
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {AsyncGenerator} generator
		 * @return {object}
		 */
		function enqueueComponentGenerator (element, generator) {
			return function then (resolve, reject) {
				return generator.next(element.cache).then(function (value) {
					if (value.done !== true || value.value !== undefined)
						resolve(element.cache = value.value, value.done, then(resolve, reject))
					else if (element.context)
						resolve(element.cache, value.done)
				}, reject)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Component} owner
		 * @param {(object|function)} state
		 * @param {number} signature
		 * @param {function?} callback
		 */
		function enqueueComponentUpdate (element, owner, state, signature, callback) {
			if (state)
				if (!element)
					owner.state = state
				else switch (typeof state) {
					case 'function':
						return enqueueComponentUpdate(element, owner, enqueueStateCallback(element, owner, state), signature, callback)
					case 'object':
						if (thenable(owner[SymbolCache] = state))
							return enqueueStatePromise(element, owner, state, signature, callback)
						else
							enqueueComponentElement(element, owner, signature)
				}
		
			if (callback)
				enqueueStateCallback(element, owner, callback)
		}
		
		/**
		 * @param {Element} element
		 * @param {Component} owner
		 * @param {number} signature
		 */
		function enqueueComponentElement (element, owner, signature) {
			if (!element.active)
				merge(owner.state, owner[SymbolCache])
			else if (element.work === SharedWorkUpdating)
				merge(owner[SymbolState], owner[SymbolCache])
			else
				updateComponentElement(element, element, element, signature)
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {object?} value
		 */
		function enqueueComponentValue (element, name, value) {
			if (value)
				switch (typeof value) {
					case 'object':
					case 'function':
						switch (name) {
							case SharedGetInitialState:
							case SharedGetChildContext:
							case SharedComponentShouldUpdate:
								break
							default:
								enqueueComponentUpdate(element, element.owner, value, SharedComponentStateUpdate)
						}
				}
		
			return value
		}
		
		/**
		 * @param {Element} element
		 * @param {Component} owner
		 * @param {Promise} state
		 * @param {number} signature
		 * @param {function?} callback
		 */
		function enqueueStatePromise (element, owner, state, signature, callback) {
			state.then(function (value) {
				if (fetchable(Object(value)))
					enqueueComponentUpdate(element, owner, value.json(), signature, callback)
				else
					enqueueComponentUpdate(element, owner, value, signature, callback)
			}, function (err) {
				if (!thenable(element.children.type))
					invokeErrorBoundary(element, err, SharedSiteSetState)
				else try {
					owner[SymbolException] = createErrorException(element, err, SharedSiteSetState)
				} finally {
					enqueueStateCallback(element, owner, callback)
				}
			})
		}
		
		/**
		 * @param {Element} element
		 * @param {Component} owner
		 * @param {function} callback
		 */
		function enqueueStateCallback (element, owner, callback) {
			try {
				if (typeof callback === 'function')
					return callback.call(owner, owner.state, owner.props, owner.context)
			} catch (err) {
				invokeErrorBoundary(element, err, SharedSiteCallback)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {function} callback
		 * @param {*?} a
		 * @param {*?} b
		 * @param {*?} c
		 * @return {*?}
		 */
		function getLifecycleCallback (element, callback, a, b, c) {
			try {
				if (typeof callback === 'function')
					return callback.call(element.owner, a, b, c)
			} catch (err) {
				throwErrorException(element, err, SharedSiteCallback)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {*}
		 */
		function getLifecycleUnmount (element, name) {
			try {
				return element.owner[name](getNodeOwner(getElementDescription(element)))
			} catch (err) {
				invokeErrorBoundary(element, err, name)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {*}
		 */
		function getLifecycleMount (element, name) {
			try {
				enqueueComponentValue(element, name, element.owner[name](getNodeOwner(getElementDescription(element))))
			} catch (err) {
				throwErrorException(element, err, name)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {function} type
		 * @param {object} props
		 * @param {object} context
		 * @return {Component}
		 */
		function getLifecycleInstance (element, type, props, context) {
			try {
				return element.owner = new type(props, context)
			} catch (err) {
				throwErrorException(element, err, SharedSiteConstructor)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Component} owner
		 * @return {Element}
		 */
		function getLifecycleRender (element, owner) {
			try {
				return getElementDefinition(owner.render(owner.props, owner.state, owner.context))
			} catch (err) {
				throwErrorException(element, err, SharedSiteRender)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Component} owner
		 * @param {Exception} exception
		 */
		function getLifecycleBoundary (element, owner, exception) {
			try {
				enqueueComponentValue(element, SharedComponentDidCatch, owner[SharedComponentDidCatch](exception.error, exception))
			} catch (err) {
				throwErrorException(element, err, SharedComponentDidCatch)
			} finally {
				exception.bubbles = false
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {object} props
		 * @param {object} state
		 * @param {object} context
		 * @return {*}
		 */
		function getLifecycleUpdate (element, name, props, state, context) {
			if (name !== SharedComponentDidUpdate)
				element.work = SharedWorkUpdating
		
			try {
				return enqueueComponentValue(element, name, element.owner[name](props, state, context))
			} catch (err) {
				throwErrorException(element, err, name)
			} finally {
				element.work = SharedWorkIdle
			}
		}
		
		
		/**
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 */
		function ContextProvider (props, context) {
		  Component.call(this, props, context)
		}
		/**
		 * @type {object}
		 */
		ContextProvider[SharedSitePrototype] = objectCreate(Component[SharedSitePrototype], {
		  getInitialState: {
		    value: function (props, state, context) {
		      return (this[SymbolElement].context = merge({}, context))[props.uuid] = {provider: this, consumers: new List()}
		    }
		  },
		  render: {
		    value: function (props) {
		      return props.children
		    }
		  },
		  componentDidUpdate: {
		    value: function (props) {
		      !is(this.props.value, props.value) && this.state.consumers.forEach(this.componentChildUpdate)
		    }
		  },
		  componentChildUpdate: {
		    value: function (consumer) {
		      consumer.didUpdate = consumer.didUpdate ? false : !!consumer[SharedSiteForceUpdate]()
		    }
		  }
		})
		
		/**
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 */
		function ContextConsumer (props, context) {
		  Component.call(this, props, context)
		}
		/**
		 * @type {object}
		 */
		ContextConsumer[SharedSitePrototype] = objectCreate(Component[SharedSitePrototype], {
		  getInitialState: {
		    value: function (props) {
		      return this.context[props.uuid] || {provider: this}
		    }
		  },
		  render: {
		    value: function (props, state) {
		      return props.children(state.provider.props.value)
		    }
		  },
		  componentWillReceiveProps: {
		    value: function () {
		      this.didUpdate = true
		    }
		  },
		  componentDidMount: {
		    value: function () {
		      this.state.consumers && this.state.consumers.insert(this, this.state.consumers)
		    }
		  },
		  componentWillUnmount: {
		    value: function () {
		      this.state.consumers && this.state.consumers.remove(this)
		    }
		  }
		})
		
		/**
		 * @param {object} value
		 * @return {object}
		 */
		function createContextComponent (value) {
		  return {
		    Provider: function Provider (props) {
		      return createElement(ContextProvider, assign({}, value, props))
		    },
		    Consumer: function Consumer (props) {
		      return createElement(ContextConsumer, assign({}, value, props))
		    }
		  }
		}
		
		/**
		 * @param {*} value
		 * @return {object}
		 */
		function createContext (value) {
		  return createContextComponent({value: value, children: noop, uuid: random('dio.Context')})
		}
		
		/**
		 * @param {*} element
		 * @return {object?}
		 */
		function findDOMNode (element) {
			if (!element)
				return element
		
			if (isValidElement(element[SymbolElement]))
				return findDOMNode(element[SymbolElement])
		
			if (isValidElement(element))
				return element.active && getNodeOwner(getElementDescription(element))
		
			if (isValidNodeEvent(element))
				return getNodeTarget(element)
		
			if (isValidNodeTarget(element))
				return element
		}
		
		/**
		 * @param {*} element
		 * @param {object} container
		 * @param {function?} callback
		 */
		function render (element, container, callback) {
			if (!container)
				render(element, getNodeDocument(), callback)
			else if (registry.has(container))
				updateContainerElement(registry.get(container).children, getElementDefinition(element), callback)
			else
				mountContainerElement(element, container, callback, SharedMountOwner)
		}
		
		/**
		 * @param {*} element
		 * @param {object} container
		 * @param {function?} callback
		 */
		function hydrate (element, container, callback) {
			if (!container)
				hydrate(element, getNodeDocument(), callback)
			else
				mountContainerElement(element, container, callback, SharedMountQuery)
		}
		
		/**
		 * @param {Node} container
		 * @return {boolean}
		 */
		function unmountComponentAtNode (container) {
			return registry.has(container) && !render(null, container)
		}
		
		/**
		 * @param {Element} element
		 * @param {object} container
		 * @param {function} callback
		 * @param {number} signature
		 */
		function mountContainerElement (element, container, callback, signature) {
			if (!isValidElement(element))
				mountContainerElement(getElementDefinition(element), container, callback, signature)
			else if (!isValidNodeTarget(container))
				invariant(SharedSiteRender, 'Target container is not a valid container')
			else
				commitContainerElement(element, createElementSnapshot(element), container, signature)
		
			if (callback)
				getLifecycleCallback(element, callback)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} snapshot
		 * @param {Element} callback
		 */
		function updateContainerElement (element, snapshot, callback) {
			reconcileElement(element, snapshot, element.host)
		
			if (callback)
				getLifecycleCallback(element, callback)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @param {object} container
		 * @param {number} signature
		 */
		function commitContainerElement (element, parent, container, signature) {
			registry.set(parent.owner = container, parent)
		
			if (signature === SharedMountOwner)
				setNodeDocument(parent)
		
			commitMountElement(element, element, parent, parent, SharedOwnerAppend, signature)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} sibling
		 * @param {Element} parent
		 * @param {Element} host
		 * @param {number} operation
		 * @param {number} signature
		 */
		function commitMountElement (element, sibling, parent, host, operation, signature) {
			element.host = host
			element.parent = parent
		
			switch (element.id) {
				case SharedElementComponent:
					commitMountComponentElement(element, sibling, parent, host, operation, signature)
		
					return
				case SharedElementPromise:
					commitMountElementPromise(element, host, element.type)
				case SharedElementFragment:
				case SharedElementPortal:
					element.owner = element.id !== SharedElementPortal ? parent.owner : getNodePortal(element)
		
					commitMountElementChildren(element, sibling, host, operation, signature)
					commitOwner(element)
		
					return
				case SharedElementCustom:
				case SharedElementNode:
					element.xmlns = getNodeType(element, parent.xmlns)
				default:
					switch (signature) {
						case SharedMountQuery:
							if (commitOwnerQuery(element, parent))
								break
						default:
							commitOwner(element)
		
							if (operation === SharedOwnerAppend)
								commitOwnerAppend(element, parent)
							else
								commitOwnerInsert(element, sibling, parent)
					}
		
					if (element.id > SharedElementNode)
						return
			}
		
			commitMountElementChildren(element, sibling, host, SharedOwnerAppend, signature)
			commitOwnerProps(element, getNodeInitialProps(element, element.props), element.xmlns, SharedPropsMount)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} sibling
		 * @param {Element} host
		 * @param {number} operation
		 * @param {number} signature
		 */
		function commitMountElementChildren (element, sibling, host, operation, signature) {
			for (var children = element.children, length = children.length; length > 0; --length)
				commitMountElement(children = children.next, sibling, element, host, operation, signature)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} snapshot
		 * @param {Element} host
		 */
		function commitMountElementReplace (element, snapshot, host) {
			var parent = element.parent
			var sibling = getElementSibling(element, parent, SharedLinkedNext)
		
			commitUnmountElement(element, parent)
		
			if (sibling.active)
				commitMountElement(snapshot, sibling, parent, host, SharedOwnerInsert, SharedMountOwner)
			else
				commitMountElement(snapshot, sibling, parent, host, SharedOwnerAppend, SharedMountOwner)
		
			if (snapshot.active)
				if (element !== host.children)
					replaceElementChildren(element, snapshot, parent.children)
				else
					host.children = snapshot
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} host
		 * @param {object} type
		 */
		function commitMountElementPromise (element, host, type) {
			type.then(function (value) {
				element.active && element.type === type && reconcileElementChildren(element, getElementModule(value), host)
			}, function (err) {
				invokeErrorBoundary(element, err, SharedSiteRender)
			})
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} sibling
		 * @param {Element} parent
		 * @param {Element} host
		 * @param {number} operation
		 * @param {number} signature
		 */
		function commitMountComponentElement (element, sibling, parent, host, operation, signature) {
			try {
				commitMountComponentChildren(mountComponentInstance(element), sibling, parent, element, operation, signature)
		
				if (element.owner[SharedComponentDidMount])
					getLifecycleMount(element, SharedComponentDidMount, element.owner)
		
				if (element.ref)
					commitOwnerRefs(element, element.ref, SharedRefsDispatch)
			} catch (err) {
				commitMountComponentChildren(getElementDefinition(), sibling, parent, host, operation, signature)
				replaceErrorBoundary(element, host, parent, err)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} sibling
		 * @param {Element} parent
		 * @param {Element} host
		 * @param {number} operation
		 * @param {number} signature
		 */
		function commitMountComponentChildren (element, sibling, parent, host, operation, signature) {
			commitMountElement(host.children = element, sibling, parent, host, operation, signature)
			commitOwner(host)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 */
		function commitUnmountPromise (element, parent) {
			element.cache.then(function () {
				commitOwnerRemove(element, parent)
			})
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 */
		function commitUnmountElement (element, parent) {
			if (!element.active)
				return
		
			commitUnmountElementChildren(element, parent, element)
		
			if (element.id === SharedElementComponent)
				if (element.cache)
					return commitUnmountPromise(element, parent)
		
			commitOwnerRemove(element, parent)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @param {Element} host
		 */
		function commitUnmountElementChildren (element, parent, host) {
			switch (element.active = false, element.id) {
				case SharedElementComponent:
					commitUnmountComponentElement(element, parent, host)
				case SharedElementSnapshot:
					break
				case SharedElementText:
				case SharedElementEmpty:
				case SharedElementComment:
					return willNodeUnmount(element, parent, host)
				case SharedElementPortal:
					if (element.active = (element !== host && parent.id > SharedElementSnapshot))
						return commitUnmountElement(element, parent)
				default:
					for (var children = element.children, length = children.length; length > 0; --length)
						commitUnmountElementChildren(children = children.next, element, host)
		
					willNodeUnmount(element, parent, host)
			}
		
			if (element.ref)
				commitOwnerRefs(element, element.ref, SharedRefsRemove)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @param {Element} host
		 */
		function commitUnmountComponentElement (element, parent, host) {
			commitUnmountComponentChildren(element, parent, host, element.children)
			unmountComponentInstance(element)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @param {Element} host
		 * @param {Element} children
		 */
		function commitUnmountComponentChildren (element, parent, host, children) {
			commitUnmountElementChildren(children, parent, element !== host ? host : children)
		}
		
		/**
		 * @param {Element} element
		 */
		function commitOwner (element) {
			try {
				switch (element.id) {
					case SharedElementNode:
						element.owner = createNodeElement(element)
						break
					case SharedElementText:
						element.owner = createNodeText(element)
						break
					case SharedElementEmpty:
						element.owner = createNodeEmpty(element)
						break
					case SharedElementComment:
						element.owner = createNodeComment(element)
						break
					case SharedElementCustom:
						element.owner = createNodeComponent(element)
					case SharedElementComponent:
					case SharedElementPortal:
						break
					default:
						element.owner = getElementBoundary(element, SharedLinkedNext).owner
				}
			} catch (err) {
				throwErrorException(element, err, SharedSiteRender)
			} finally {
				element.active = true
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @return {boolean}
		 */
		function commitOwnerQuery (element, parent) {
			return element.active = !!(
				element.owner = getNodeQuery(
					element,
					parent,
					getElementDescription(getElementSibling(element, parent, SharedLinkedPrevious)),
					getElementSibling(element, parent, SharedLinkedNext)
				)
			)
		}
		
		/**
		 * @param {Element} element
		 * @param {(function|string)?} callback
		 * @param {number} signature
		 * @param {*} key
		 */
		function commitOwnerRefs (element, callback, signature, key) {
			switch (typeof callback) {
				case 'string':
					if (signature === SharedRefsRemove)
						commitOwnerRefs(element, getComponentReference, SharedRefsRemove, callback)
					else
						commitOwnerRefs(element, getComponentReference, SharedRefsDispatch, callback)
					break
				case 'function':
					switch (signature) {
						case SharedRefsRemove:
							return getLifecycleCallback(element.host, callback, element.ref = null, key, element)
						case SharedRefsAssign:
							element.ref = callback
						case SharedRefsDispatch:
							return getLifecycleCallback(element.host, callback, element.owner, key, element)
						case SharedRefsReplace:
							commitOwnerRefs(element, element.ref, SharedRefsRemove, key)
							commitOwnerRefs(element, callback, SharedRefsAssign, key)
					}
					break
				default:
					commitOwnerRefs(element, element.ref === callback ? noop : element.ref, SharedRefsRemove, key)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {number} props
		 * @param {string?} xmlns
		 * @param {number} signature
		 */
		function commitOwnerProps (element, props, xmlns, signature) {
			for (var key in props)
				switch (key) {
					case 'ref':
						commitOwnerRefs(element, props[key], signature)
					case 'key':
					case 'xmlns':
					case 'children':
						break
					default:
						setNodeProps(element, key, props[key], xmlns)
				}
		}
		
		/**
		 * @param {Element} element
		 * @param {object} props
		 */
		function commitOwnerPropsUpdate (element, props) {
			commitOwnerProps(element, getNodeUpdatedProps(element, props), element.xmlns, SharedPropsUpdate)
		}
		
		/**
		 * @param {Element} element
		 * @param {string} value
		 */
		function commitOwnerContent (element, value) {
			switch (element.id) {
				case SharedElementText:
					return setNodeText(element, value)
				case SharedElementComment:
					return setNodeComment(element, value)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 */
		function commitOwnerRemove (element, parent) {
			if (parent.id < SharedElementPortal)
				return commitOwnerRemove(element, getElementParent(parent))
		
			switch (element.id) {
				case SharedElementPortal:
				case SharedElementPromise:
				case SharedElementFragment:
					return element.children.forEach(function (children) {
						commitOwnerRemove(getElementDescription(children), element)
					})
				case SharedElementComponent:
					return commitOwnerRemove(getElementDescription(element), parent)
			}
		
			removeNodeChild(element, parent)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} sibling
		 * @param {Element} parent
		 */
		function commitOwnerInsert (element, sibling, parent) {
			if (parent.id < SharedElementSnapshot)
				if (parent.id < SharedElementPortal)
					return commitOwnerInsert(element, sibling, getElementParent(parent))
				else if (!parent.active)
					return commitOwnerAppend(element, parent)
		
			switch (sibling.id) {
				case SharedElementPortal:
					return commitOwnerInsert(element, getElementSibling(sibling, parent, SharedLinkedNext), parent)
				case SharedElementPromise:
				case SharedElementFragment:
					return commitOwnerInsert(element, getElementBoundary(sibling, SharedLinkedNext), parent)
				case SharedElementComponent:
					return commitOwnerInsert(element, getElementDescription(sibling), parent)
				case SharedElementSnapshot:
					return commitOwnerAppend(element, parent)
			}
		
			switch (element.id) {
				case SharedElementPortal:
					return
				case SharedElementPromise:
				case SharedElementFragment:
					return element.children.forEach(function (children) {
						commitOwnerInsert(getElementDescription(children), sibling, parent)
					})
				case SharedElementComponent:
					return commitOwnerInsert(getElementDescription(element), sibling, parent)
			}
		
			insertNodeChild(element, sibling, parent)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 */
		function commitOwnerAppend (element, parent) {
			if (parent.id < SharedElementPortal)
				return commitOwnerAppend(element, getElementParent(parent))
		
			switch (element.id) {
				case SharedElementPortal:
					return
				case SharedElementPromise:
				case SharedElementFragment:
					return element.children.forEach(function (children) {
						commitOwnerAppend(getElementDescription(children), parent)
					})
				case SharedElementComponent:
					return commitOwnerAppend(getElementDescription(element), parent)
			}
		
			appendNodeChild(element, parent)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} snapshot
		 * @param {Element} host
		 */
		function reconcileElement (element, snapshot, host) {
			if (!element.active)
				return
		
			if (element.key !== snapshot.key)
				return commitMountElementReplace(element, snapshot, host)
		
			if (element.id === SharedElementPromise && snapshot.id === SharedElementPromise)
				return commitMountElementPromise(element, host, element.type = snapshot.type)
		
			if (element.type !== snapshot.type)
				return commitMountElementReplace(element, snapshot, host)
		
			switch (element.id) {
				case SharedElementText:
				case SharedElementComment:
					if (element.children !== snapshot.children)
						commitOwnerContent(element, element.children = snapshot.children)
				case SharedElementEmpty:
					return
				case SharedElementPortal:
				case SharedElementFragment:
					return reconcileElementChildren(element, snapshot, host)
				case SharedElementComponent:
					return updateComponentElement(element, snapshot, host, SharedComponentPropsUpdate)
			}
		
			reconcileElementChildren(element, snapshot, host)
			commitOwnerPropsUpdate(element, reconcileElementProps(element.props, element.props = snapshot.props))
		}
		
		/**
		 * @param {object} prevProps
		 * @param {object} nextProps
		 * @return {object?}
		 */
		function reconcileElementProps (prevProps, nextProps) {
			if (prevProps === nextProps)
				return
		
			var length = 0
			var props = {}
		
			for (var key in prevProps)
				if (!objectHasOwnProperty.call(nextProps, key))
					props[(++length, key)] = null
		
			for (var key in nextProps) {
				var next = nextProps[key]
				var prev = prevProps[key]
		
				if (next !== prev)
					if (typeof next !== 'object' || next === null)
						props[(++length, key)] = next
					else if (key !== 'children' && (next = reconcileElementProps(prev || {}, next)))
						props[(++length, key)] = next
			}
		
			if (length > 0)
				return props
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} snapshot
		 * @param {Element} host
		 */
		function reconcileElementChildren (element, snapshot, host) {
			var signature = SharedOwnerAppend
			var children = element.children
			var siblings = snapshot.children
			var oldLength = children.length
			var newLength = siblings.length
		
			if (oldLength + newLength === 0)
				return
		
			var oldPos = 0
			var newPos = 0
			var oldEnd = oldLength - 1
			var newEnd = newLength - 1
			var oldHead = children.next
			var newHead = siblings.next
			var oldTail = children.prev
			var newTail = siblings.prev
			var oldNext = oldHead
			var newNext = newHead
			var oldPrev = oldTail
			var newPrev = newTail
		
			// step 1, prefix/suffix
			outer: while (true) {
				while (oldHead.key === newHead.key) {
					oldNext = oldHead.next
					newNext = newHead.next
		
					reconcileElement(oldHead, newHead, host)
		
					++oldPos
					++newPos
		
					if (oldPos > oldEnd || newPos > newEnd)
						break outer
		
					oldHead = oldNext
					newHead = newNext
				}
		
				while (oldTail.key === newTail.key) {
					oldPrev = oldTail.prev
					newPrev = newTail.prev
		
					reconcileElement(oldTail, newTail, host)
		
					--oldEnd
					--newEnd
		
					if (oldPos > oldEnd || newPos > newEnd)
						break outer
		
					oldTail = oldPrev
					newTail = newPrev
				}
		
				break
			}
		
			// step 2, mount/remove
			if (oldPos > oldEnd++) {
				if (newPos <= newEnd++) {
					if (newEnd < newLength)
						signature = SharedOwnerInsert
					else if ((oldTail = children, oldLength > 0))
						newHead = newNext
		
					while (newPos++ < newEnd) {
						newHead = (oldHead = newHead).next
						commitMountElement(children.insert(oldHead, oldTail), oldTail, element, host, signature, SharedMountOwner)
					}
				}
			} else if (newPos > newEnd++) {
				if (newEnd === newLength && newLength > 0)
					oldHead = oldNext
		
				while (oldPos++ < oldEnd) {
					oldHead = (newHead = oldHead).next
					commitUnmountElement(children.remove(newHead), element)
				}
			} else {
				reconcileElementSiblings(element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd, oldLength)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} host
		 * @param {List} children
		 * @param {Element} oldHead
		 * @param {Element} newHead
		 * @param {number} oldPos
		 * @param {number} newPos
		 * @param {number} oldEnd
		 * @param {number} newEnd
		 * @param {number} oldLength
		 */
		function reconcileElementSiblings (element, host, children, oldHead, newHead, oldPos, newPos, oldEnd, newEnd, oldLength) {
			var oldIndex = oldPos
			var newIndex = newPos
			var oldChild = oldHead
			var newChild = newHead
			var prevChild = oldChild
			var nextChild = oldChild
			var prevMoved = oldChild
			var nextMoved = oldChild
			var prevNodes = {}
			var nextNodes = {}
		
			// step 3, hashmap
			while (oldIndex < oldEnd || newIndex < newEnd) {
				if (oldIndex < oldEnd && (prevNodes[oldChild.key] = oldChild, ++oldIndex !== oldLength))
					oldChild = oldChild.next
		
				if (newIndex < newEnd && (nextNodes[newChild.key] = newChild, ++newIndex !== newEnd))
					newChild = newChild.next
			}
		
			// step 4, mount/move
			while (newIndex-- > newPos) {
				prevChild = newChild.prev
				nextChild = newChild.next
				prevMoved = prevNodes[newChild.key]
				nextMoved = prevNodes[nextChild.key]
		
				if (isValidElement(prevMoved)) {
					if (!isValidElement(nextChild)) {
						if (isValidElement(nextMoved = prevMoved.next) && isValidElement(nextNodes[nextMoved.key])) {
							if (prevChild.key === oldChild.key) {
								commitOwnerAppend(children.insert(children.remove(prevMoved), children), element)
							} else if (nextMoved !== oldChild) {
								if (isValidElement(nextChild = nextNodes[oldChild.key])) {
									if (oldChild.prev.key === nextChild.prev.key)
										commitOwnerAppend(children.insert(children.remove(prevMoved), children), element)
									else
										commitOwnerInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
								} else if (nextMoved.key !== oldChild.prev.key) {
									commitOwnerInsert(children.insert(children.remove(prevMoved), oldChild), oldChild, element)
								}
							}
						}
					} else {
						nextChild = nextChild.active ? nextChild : nextMoved || oldChild
						nextMoved = prevMoved.next
		
						if (nextChild.key !== nextMoved.key) {
							while (isValidElement(nextMoved) && !isValidElement(nextNodes[nextMoved.key]))
								nextMoved = nextMoved.next
		
							if (nextChild.key !== nextMoved.key)
								if (prevChild.key !== prevMoved.prev.key || nextChild.key !== nextMoved.next.key)
									commitOwnerInsert(children.insert(children.remove(prevMoved), nextChild), nextChild, element)
						}
					}
				} else if (!isValidElement(nextChild)) {
					commitMountElement(children.insert(newChild, children), newChild, element, host, SharedOwnerAppend, SharedMountOwner)
				} else {
					nextChild = nextChild.active ? nextChild : (nextMoved || oldChild)
					commitMountElement(children.insert(newChild, nextChild), nextChild, element, host, SharedOwnerInsert, SharedMountOwner)
				}
		
				newChild = prevChild
			}
		
			// step 5, remove/update
			for (var oldKey in prevNodes)
				if (isValidElement((oldChild = prevNodes[oldKey], newChild = nextNodes[oldKey])))
					reconcileElement(oldChild, newChild, host)
				else
					commitUnmountElement(children.remove(oldChild), element)
		}
		
		var registry = new WeakMap()
		
		var setNodeDocument = getFactory('setDocument', setDOMDocument)
		var setNodeText = getFactory('setText', setDOMText)
		var setNodeComment = getFactory('setComment', setDOMComment)
		var setNodeProps = getFactory('setProps', setDOMProps)
		
		var getNodeContext = getFactory('getContext', getDOMContext)
		var getNodeOwner = getFactory('getOwner', getDOMOwner)
		var getNodeDocument = getFactory('getDocument', getDOMDocument)
		var getNodeTarget = getFactory('getTarget', getDOMTarget)
		var getNodeListener = getFactory('getListener', getDOMListener)
		var getNodeType = getFactory('getType', getDOMType)
		var getNodePortal = getFactory('getPortal', getDOMPortal)
		var getNodeQuery = getFactory('getQuery', getDOMQuery)
		
		var getNodeInitialProps = getFactory('getInitialProps', getDOMInitialProps)
		var getNodeUpdatedProps = getFactory('getUpdatedProps', getDOMUpdatedProps)
		
		var isValidNodeTarget = getFactory('isValidTarget', isValidDOMTarget)
		var isValidNodeEvent = getFactory('isValidEvent', isValidDOMEvent)
		var isValidNodeComponent = getFactory('isValidComponent', isValidDOMComponent)
		
		var willNodeUnmount = getFactory('willUnmount', willDOMUnmount)
		
		var insertNodeChild = getFactory('insertChild', insertDOMChild)
		var appendNodeChild = getFactory('appendChild', appendDOMChild)
		var removeNodeChild = getFactory('removeChild', removeDOMChild)
		
		var createNodeText = getFactory('createText', createDOMText)
		var createNodeEmpty = getFactory('createEmpty', createDOMEmpty)
		var createNodeComment = getFactory('createComment', createDOMComment)
		var createNodeElement = getFactory('createElement', createDOMElement)
		var createNodeComponent = getFactory('createComponent', createDOMComponent)
		
		/**
		 * @param {Element} element
		 */
		function setDOMDocument (element) {
			element.owner.textContent = ''
		}
		
		/**
		 * @param {Element} element
		 * @param {string} value
		 */
		function setDOMText (element, value) {
			element.owner.nodeValue = value
		}
		
		/**
		 * @param {Element} element
		 * @param {string} value
		 */
		function setDOMComment (element, value) {
			element.owner.nodeValue = value
		}
		
		/**
		 * @param {Element} element
		 * @param {string} type
		 * @param {(function|EventListener)?} callback
		 */
		function setDOMEvent (element, type, callback) {
			if (!element.cache)
				element.cache = {}
		
			if (!element.cache[type])
				element.owner.addEventListener(type, element, false)
		
			element.cache[type] = callback
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {(object|string)?} value
		 */
		function setDOMStyle (element, name, value) {
			if (typeof value === 'object')
				for (var property in value) {
					var declaration = value[property]
		
					if (property.indexOf('-') === -1)
						element.owner.style[property] = declaration !== false && declaration !== undefined ? declaration : ''
					else
						element.owner.style.setProperty(property, declaration)
				}
			else
				setDOMAttribute(element, name, value, '')
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {*} value
		 */
		function setDOMProperty (element, name, value) {
			switch (value) {
				case null:
				case false:
				case undefined:
					return setDOMAttribute(element, name, value, element.owner[name] = '')
				default:
					element.owner[name] = value
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {*} value
		 * @param {string?} xmlns
		 */
		function setDOMAttribute (element, name, value, xmlns) {
			switch (value) {
				case null:
				case false:
				case undefined:
					if (xmlns)
						element.owner.removeAttributeNS(xmlns, name)
		
					return element.owner.removeAttribute(name)
				case true:
					return setDOMAttribute(element, name, '', xmlns)
				default:
					if (!xmlns)
						element.owner.setAttribute(name, value)
					else
						element.owner.setAttributeNS(xmlns, name, value)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {*} value
		 * @param {string?} xmlns
		 */
		function setDOMProps (element, name, value, xmlns) {
			switch (name) {
				case 'style':
					return setDOMStyle(element, name, value)
				case 'className':
					if (!xmlns && value)
						return setDOMProperty(element, name, value)
				case 'class':
					return setDOMAttribute(element, 'class', value, '')
				case 'xlink:href':
					return setDOMAttribute(element, name, value, 'http://www.w3.org/1999/xlink')
				case 'innerHTML':
					return setDOMInnerHTML(element, name, value ? value : '', [])
				case 'dangerouslySetInnerHTML':
					return setDOMProps(element, 'innerHTML', value && value.__html, xmlns)
				case 'acceptCharset':
					return setDOMProps(element, 'accept-charset', value, xmlns)
				case 'httpEquiv':
					return setDOMProps(element, 'http-equiv', value, xmlns)
				case 'tabIndex':
					return setDOMProps(element, name.toLowerCase(), value, xmlns)
				case 'autofocus':
				case 'autoFocus':
					return element.owner[value ? 'focus' : 'blur']()
				case 'width':
				case 'height':
					if (element.type === 'img')
						return setDOMAttribute(element, name, value, '')
			}
		
			if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 2)
				return setDOMEvent(element, name.substring(2).toLowerCase(), value)
		
			switch (typeof value) {
				case 'object':
					return setDOMProperty(element, name, value && element.props[name])
				case 'string':
				case 'number':
				case 'boolean':
					if (xmlns || !(name in element.owner))
						return setDOMAttribute(element, name, value, '')
				default:
					setDOMProperty(element, name, value)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {string} value
		 * @param {Array} nodes
		 */
		function setDOMInnerHTML (element, name, value, nodes) {
			if (element.owner[name])
				element.children.forEach(function (children) {
					nodes.push(children.owner)
				})
		
			if (element.owner[name] = value)
				nodes.push.apply(nodes, element.owner.childNodes)
		
			nodes.forEach(function (node) {
				element.owner.appendChild(node)
			})
		}
		
		/**
		 * @param {Element} element
		 * @return {object}
		 */
		function getDOMContext (element) {
			return {}
		}
		
		/**
		 * @param {Element} element
		 * @return {object}
		 */
		function getDOMOwner (element) {
			return element.owner
		}
		
		/**
		 * @return {Node}
		 */
		function getDOMDocument () {
			return document.documentElement
		}
		
		/**
		 * @param {Event} event
		 * @return {Node}
		 */
		function getDOMTarget (event) {
			return event.currentTarget
		}
		
		/**
		 * @param {Event} event
		 * @return {function}
		 */
		function getDOMListener (element, event) {
			return element.cache[event.type]
		}
		
		/**
		 * @param {Element} element
		 * @param {string?} xmlns
		 */
		function getDOMType (element, xmlns) {
			switch (element.type) {
				case 'svg':
					return 'http://www.w3.org/2000/svg'
				case 'math':
					return 'http://www.w3.org/1998/Math/MathML'
				case 'foreignObject':
					return
				default:
					return xmlns
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {object} props
		 * @return {object?}
		 */
		function getDOMInitialProps (element, props) {
			if (element.type === 'input')
				return merge({type: null, step: null, min: null, max: null}, props)
		
			return props
		}
		
		/**
		 * @param {Element} element
		 * @param {object} props
		 * @return {object?}
		 */
		function getDOMUpdatedProps (element, props) {
			return props
		}
		
		/**
		 * @param {Element} element
		 * @return {Node}
		 */
		function getDOMPortal (element) {
			if (typeof element.type === 'string')
				return getDOMDocument().querySelector(element.type)
		
			if (isValidDOMTarget(element.type))
				return element.type
		
			return getDOMDocument()
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @param {Element} previousSibling
		 * @param {Element} nextSibling
		 * @return {object?}
		 */
		function getDOMQuery (element, parent, previousSibling, nextSibling) {
			var id = element.id
			var type = id > SharedElementComment ? '#text' : element.type.toLowerCase()
			var props = element.props
			var children = element.children
			var length = children.length
			var target = previousSibling.active ? previousSibling.owner.nextSibling : parent.owner.firstChild
			var sibling = target
			var node = null
		
			while (target) {
				if (target.nodeName.toLowerCase() === type) {
					if (id > SharedElementNode) {
						if (id > SharedElementComment)
							if (nextSibling.id > SharedElementNode)
								target.splitText(0)
		
						if (target.nodeValue !== children)
							target.nodeValue = children
					} else if (length === 0 && target.firstChild) {
						target.textContent = ''
					}
		
					if (parent.id === SharedElementPortal)
						getDOMPortal(parent).appendChild(target)
		
					node = target
					type = null
		
					if (!(target = target.nextSibling) || nextSibling.type)
						break
				}
		
				if (id > SharedElementComment && length === 0) {
					target.parentNode.insertBefore(node = createDOMText(element), target)
		
					if (!nextSibling.type)
						type = null
					else
						break
				}
		
				target = (sibling = target).nextSibling
				sibling.parentNode.removeChild(sibling)
			}
		
			if (node && node.attributes)
				for (var attributes = node.attributes, i = attributes.length - 1; i >= 0; --i)
					if (props[type = attributes[i].name] == null)
						node.removeAttribute(type)
		
			return node
		}
		
		/**
		 * @param {function} constructor
		 * @return {boolean}
		 */
		function isValidDOMComponent (constructor) {
			return isValidDOMTarget(constructor[SharedSitePrototype])
		}
		
		/**
		 * @param {object?} target
		 * @param {boolean}
		 */
		function isValidDOMTarget (target) {
			return target != null && target.ELEMENT_NODE === 1
		}
		
		/**
		 * @param {object?} event
		 * @return {boolean}
		 */
		function isValidDOMEvent (event) {
			return event != null && event.BUBBLING_PHASE === 3
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @param {Element} host
		 */
		function willDOMUnmount (element, parent, host) {}
		
		/**
		 * @param {Element} element
		 * @param {Element} sibling
		 * @param {Element} parent
		 */
		function insertDOMChild (element, sibling, parent) {
			parent.owner.insertBefore(element.owner, sibling.owner)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 */
		function appendDOMChild (element, parent) {
			parent.owner.appendChild(element.owner)
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 */
		function removeDOMChild (element, parent) {
			parent.owner.removeChild(element.owner)
		}
		
		/**
		 * @param {Element} element
		 * @return {object}
		 */
		function createDOMText (element) {
			return document.createTextNode(element.children)
		}
		
		/**
		 * @param {Element} element
		 * @return {object}
		 */
		function createDOMEmpty (element) {
			return document.createTextNode('')
		}
		
		/**
		 * @param {Element} element
		 * @return {object}
		 */
		function createDOMComment (element) {
			return document.createComment(element.children)
		}
		
		/**
		 * @param {Element} element
		 * @return {object}
		 */
		function createDOMElement (element) {
			return element.xmlns ? document.createElementNS(element.xmlns, element.type) : document.createElement(element.type)
		}
		
		/**
		 * @param {Element} element
		 * @return {object}
		 */
		function createDOMComponent (element) {
			return new element.type(element.props)
		}
		
		dio.render = render
		dio.hydrate = hydrate
		dio.Component = Component
		dio.Fragment = SymbolFragment
		dio.PureComponent = PureComponent
		dio.Children = Children
		dio.createContext = createContext
		dio.createFactory = createFactory
		dio.cloneElement = cloneElement
		dio.isValidElement = isValidElement
		dio.createPortal = createPortal
		dio.createElement = createElement
		dio.createComment = createComment
		dio.createClass = createClass
		dio.unmountComponentAtNode = unmountComponentAtNode
		dio.findDOMNode = findDOMNode
		dio.h = createElement
		
		/* istanbul ignore next */
		
		if (typeof module === 'function') module(dio, Element, mountComponentInstance, delegateErrorBoundary, getElementDefinition, createElementSnapshot, createElementEmpty, createElement, commitOwner)
		
		return dio
	}

	/* istanbul ignore next */

	if (typeof exports === 'object' && typeof module === 'object')
		module['exports'] = factory(window['process'] && window['process']['exit'] && typeof __ === 'function' && __('./cjs'))
	else if (typeof define === 'function' && define['amd'])
		define(factory())
	else
		window['dio'] = factory()
}(/* istanbul ignore next */typeof window === 'object' && window['window'] === window ?
		window : typeof global === 'object' && global['global'] === global ? global : this,
	/* istanbul ignore next */typeof arguments === 'object' && arguments[1]
));
/*!/dio*/
