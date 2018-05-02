/*!dio 9.0.4 @license MIT */
;(function (window, __) {
	'use strict'

	/* eslint-disable */

	function factory (module, exports) {
		
		var dio = {version: '9.0.4'}
		
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
		
		var SharedComponentForceUpdate = 0
		var SharedComponentPropsUpdate = 1
		var SharedComponentStateUpdate = 2
		
		var SharedRefsDispatch = 0
		var SharedRefsReplace = 1
		var SharedRefsRemove = 2
		var SharedRefsAssign = 3
		
		var SharedPropsInitial = 0
		var SharedPropsUpdate = 1
		
		var SharedMountQuery = 0
		var SharedMountOwner = 1
		
		var SharedOwnerAppend = 0
		var SharedOwnerInsert = 1
		
		var SharedWorkIdle = 0
		var SharedWorkUpdating = 1
		
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
		var ArrayIsArray = Array.isArray
		
		var ObjectDefineProperties = Object.defineProperties
		var ObjectDefineProperty = Object.defineProperty
		var ObjectHasOwnProperty = Object.hasOwnProperty
		var ObjectCreate = Object.create
		var ObjectKeys = Object.keys
		
		var SymbolFor = Symbol.for || hash
		var SymbolForCache = SymbolFor('dio.Cache')
		var SymbolForState = SymbolFor('dio.State')
		var SymbolForContext = SymbolFor('dio.Context')
		var SymbolForElement = SymbolFor('dio.Element')
		var SymbolForFragment = SymbolFor('dio.Fragment')
		var SymbolForComponent = SymbolFor('dio.Component')
		var SymbolForException = SymbolFor('dio.Exception')
		var SymbolForIterator = Symbol.iterator || '@@iterator'
		var SymbolForAsyncIterator = Symbol.asyncIterator || '@@asyncIterator'
		
		/**
		 * @name List
		 * @constructor
		 * @property {object} next
		 * @property {object} prev
		 * @property {number} length
		 */
		function List () {
			this.next = this
			this.prev = this
			this.length = 0
		}
		ObjectDefineProperties(ObjectDefineProperty(List[SharedSitePrototype], SymbolForIterator, {value: SymbolForIterator}), {
			/**
			 * @alias List#insert
			 * @memberof List
			 * @type {function}
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
			 * @alias List#remove
			 * @memberof List
			 * @type {function}
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
			 * @alias List#forEach
			 * @memberof List
			 * @type {function}
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
		 * @name WeakHash
		 * @constructor
		 * @property {symbol} hash
		 */
		function WeakHash () {
			this.hash = Symbol()
		}
		ObjectDefineProperties(WeakHash[SharedSitePrototype], {
			/**
			 * @alias WeakHash#set
			 * @memberof WeakHash
			 * @type {function}
			 * @param {any} key
			 * @param {any} value
			 */
			set: {
				value: function set (key, value) {
					key[this.hash] = value
				}
			},
			/**
			 * @alias WeakHash#get
			 * @memberof WeakHash
			 * @type {function}
			 * @param {any} key
			 * @return {any}
			 */
			get: {
				value: function get (key) {
					return key[this.hash]
				}
			},
			/**
			 * @alias WeakHash#has
			 * @memberof WeakHash
			 * @type {function}
			 * @param {any} key
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
		 * @param {object} a
		 * @return {object}
		 */
		function merge (object, a) {
			for (var key in a)
				object[key] = a[key]
		
			return object
		}
		
		/**
		 * @param {object} object
		 * @param {object} a
		 * @param {object} b
		 * @return {object}
		 */
		function assign (object, a, b) {
			for (var key in a)
				object[key] = a[key]
		
			for (var key in b)
				object[key] = b[key]
		
			return object
		}
		
		/**
		 * @param {object} object
		 * @param {object} a
		 * @return {object}
		 */
		function pickout (object, a) {
			for (var key in a)
				if (object[key] === undefined)
					object[key] = a[key]
		
			return object
		}
		
		/**
		 * @param {Array<any>} haystack
		 * @param {function} callback
		 * @param {any?} thisArg
		 */
		function find (haystack, callback, thisArg) {
			if (typeof haystack.find === 'function')
				return haystack.find(callback, thisArg)
		
			for (var i = 0; i < haystack.length; ++i)
				if (callback.call(thisArg, haystack[i], i, haystack))
					return haystack[i]
		}
		
		/**
		 * @param {any} iterable
		 * @param {function} callback
		 */
		function each (iterable, callback) {
			if (typeof iterable.forEach === 'function')
				return iterable.forEach(callback)
		
			var sequence = iterable.next(sequence)
		
			while (!sequence.done)
				sequence = iterable.next(sequence.value, callback(sequence.value))
		}
		
		/**
		 * @param {any?} iterable
		 * @param {function} callback
		 */
		function iterate (iterable, callback) {
			if (iterable == null)
				return
		
			if (typeof iterable === 'object')
				if (typeof iterable.forEach === 'function' || typeof iterable.next === 'function')
					return each(iterable, function (value) {
						iterate(value, callback)
					})
				else if (typeof iterable[SymbolForIterator] === 'function')
					return iterate(iterable[SymbolForIterator](), callback)
		
			callback(iterable)
		}
		
		/**
		 * @throws {Error}
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
				if (!ObjectHasOwnProperty.call(b, key))
					return true
		
			for (var key in b)
				if (!is(a[key], b[key]))
					return true
		
			return false
		}
		
		/**
		 * @param {any} a
		 * @param {any} b
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
		
			return (code >>> 0) - 9007199254740991
		}
		
		/**
		 * @param {object} object
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
		 * @name Element
		 * @constructor
		 * @param {number} id
		 * @property {number} id
		 * @property {boolean} active
		 * @property {number} work
		 * @property {string?} xmlns
		 * @property {(string|symbol)?} key
		 * @property {(string|function)?} ref
		 * @property {(function|string|object|symbol)?} type
		 * @property {object} props
		 * @property {object?} cache
		 * @property {any} children
		 * @property {(Component|object)?} owner
		 * @property {object?} context
		 * @property {Element?} parent
		 * @property {Element?} host
		 * @property {Element} next
		 * @property {Element} prev
		 */
		function Element (id) {
			this.id = id
			this.active = false
			this.work = SharedWorkIdle
			this.type = null
			this.props = null
			this.children = null
			this.xmlns = null
			this.key = null
			this.ref = null
			this.cache = null
			this.owner = null
			this.context = null
			this.parent = null
			this.host = null
			this.next = null
			this.prev = null
		}
		ObjectDefineProperties(ObjectDefineProperty(Element[SharedSitePrototype], SymbolForIterator, {value: SymbolForIterator}), {
			/**
			 * @alias Element#constructor
			 * @memberof Element
			 * @type {symbol}
			 */
			constructor: {
				value: SymbolForElement
			},
			/**
			 * @alias Element#handleEvent
			 * @memberof Element
			 * @type {function}
			 */
			handleEvent: {
				value: handleEvent
			}
		})
		
		/**
		 * @param {Element} snapshot
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
		 * @param {any} key
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
		 * @param {any} key
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
		
			element.type = SymbolForFragment
			element.children = createElementChildren(iterable)
		
			return element
		}
		
		/**
		 * @param {Element} type
		 * @param {object} props
		 * @return {Element}
		 */
		function createElementComponent (type, props) {
			var element = new Element(SharedElementCustom)
		
			element.type = type
			element.props = props
			element.children = createElementChildren(props.children)
			element.ref = props.ref
			element.xmlns = props.xmlns
		
			return element
		}
		
		/**
		 * @param {object} iterable
		 * @return {List}
		 */
		function createElementChildren (iterable) {
			var children = new List()
			var i = 0
		
			if (ArrayIsArray(iterable))
				for (; i < iterable.length; ++i)
					getElementChildren(children, iterable[i], i)
			else
				getElementChildren(children, iterable, i)
		
			createElementBoundary(children)
		
			return children
		}
		
		/**
		 * @throws {Error} if a known element type is not found
		 * @param {any} element
		 * @param {any} key
		 * @return {Element?}
		 */
		function createElementUnknown (element, key) {
			switch (typeof element) {
				case 'boolean':
					return createElementEmpty(key)
				case 'object':
					if (element[SymbolForIterator])
						return createElementFragment(arrayChildren(element))
		
					if (element[SymbolForAsyncIterator])
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
		 * @param {any} element
		 * @param {number} index
		 * @param {number}
		 */
		function getElementChildren (children, element, index) {
			if (element != null) {
				if (element.constructor === SymbolForElement) {
					if (element.key === undefined)
						element.key = SharedKeyBody + index
		
					children.insert(element.next === null ? element : createElementImmutable(element), children)
				} else {
					switch (typeof element) {
						case 'number':
						case 'string':
							children.insert(createElementText(element, index), children)
							break
						case 'object':
							if (ArrayIsArray(element)) {
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
		 * @param {Element} snapshot
		 * @param {object} props
		 * @return {any}
		 */
		function getElementType (element, snapshot, props) {
			return pickout(props, snapshot.props), element.xmlns = snapshot.xmlns, snapshot.type
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
		 * @param {any} value
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
				case 'string':
					if (value)
						return value.value || value
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
		 * @param {any} element
		 * @return {Element}
		 */
		function getElementDefinition (element) {
			if (element == null)
				return createElementEmpty(SharedKeyBody)
		
			if (element.constructor === SymbolForElement)
				return element
		
			switch (typeof element) {
				case 'number':
				case 'string':
					return createElementText(element, SharedKeyBody)
				case 'object':
					if (ArrayIsArray(element))
						return createElementFragment(element)
				default:
					return createElementUnknown(element, SharedKeyBody)
			}
		}
		
		/**
		 * @param {any} element
		 * @return {Element}
		 */
		function getElementModule (element) {
			if (!isValidElement(element) && ObjectHasOwnProperty.call(Object(element), 'default'))
				return getElementModule(element.default)
		
			return createElementFragment(getElementDefinition(element))
		}
		
		/**
		 * @param {any} type
		 * @return {number}
		 */
		function getElementIdentity (type) {
			switch (typeof type) {
				case 'string':
					return SharedElementNode
				case 'function':
					return SharedElementComponent
				case 'number':
				case 'symbol':
					return type === SymbolForFragment ? SharedElementFragment : SharedElementNode
				default:
					return thenable(type) ? SharedElementPromise : isValidElement(type) ? -type.id : SharedElementNode
			}
		}
		
		/**
		 * @param {object}  props
		 * @return {boolean}
		 */
		function isValidProps (props) {
			if (props == null || typeof props !== 'object' || props[SymbolForIterator] !== undefined)
				return false
		
			switch (props.constructor) {
				default:
					if (ArrayIsArray(props))
						return false
				case Object:
					return !thenable(props)
			}
		}
		
		/**
		 * @param {Element} element
		 * @return {boolean}
		 * @public
		 */
		function isValidElement (element) {
			return element != null && element.constructor === SymbolForElement
		}
		
		/**
		 * @param {Element} element
		 * @param {object?} props
		 * @param {...any?} children
		 * @return {Element}
		 * @public
		 */
		function cloneElement () {
			return createElement.apply(null, arguments)
		}
		
		/**
		 * @param {(Element|Array)} children
		 * @param {object} container
		 * @param {(string|number|symbol)?} key
		 * @return {Element}
		 * @public
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
		 * @param {(string|number|symbol)?} key
		 * @return {Element}
		 * @public
		 */
		function createComment (content, key) {
			var element = new Element(SharedElementComment)
		
			element.type = SharedLocalNameComment
			element.key = key === undefined ? null : key
			element.children = content + ''
		
			return element
		}
		
		/**
		 * @param {any} type
		 * @param {(object|any)?} value
		 * @param {...any?} children
		 * @return {Element}
		 * @public
		 */
		function createElement (type, value) {
			var identity = getElementIdentity(type)
			var i = isValidProps(value) ? 2 : 1
			var length = arguments.length
			var size = length - i
			var index = 0
			var id = identity > 0 ? identity : -identity
			var props = i === 2 ? value : {}
			var children = id !== SharedElementComponent ? new List() : undefined
			var element = new Element(id)
		
			if (size > 0)
				if (id !== SharedElementComponent)
					for (; i < length; ++i)
						index = getElementChildren(children, arguments[i], index)
				else if (size === 1)
					props.children = arguments[i]
				else for (children = props.children = []; i < length; ++i)
					children.push(arguments[i])
			else if (id !== SharedElementComponent && props.children !== undefined)
				getElementChildren(children, props.children, index)
		
			element.type = identity > 0 ? type : type = getElementType(element, type, props)
			element.props = props
		
			switch (id) {
				case SharedElementComponent:
					if (type[SharedDefaultProps])
						pickout(props, getDefaultProps(element, type, props))
					break
				case SharedElementPromise:
				case SharedElementFragment:
					createElementBoundary(children)
				default:
					element.children = children
					element.xmlns = props.xmlns
			}
		
			element.key = props.key
			element.ref = props.ref
		
			return element
		}
		
		/**
		 * @name Children
		 * @type {object}
		 * @property {function} toArray
		 * @property {function} forEach
		 * @property {function} map
		 * @property {function} filter
		 * @property {function} find
		 * @property {function} count
		 * @property {function} only
		 * @public
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
		 * @alias Children#toArray
		 * @memberof Children
		 * @param {any} children
		 * @return {Array<any>}
		 * @public
		 */
		function arrayChildren (children) {
			var array = []
		
			iterate(children, function (children) {
				array.push(children)
			})
		
			return array
		}
		
		/**
		 * @alias Children#each
		 * @memberof Children
		 * @param {any} children
		 * @param {function} callback
		 * @param {any} thisArg
		 * @public
		 */
		function eachChildren (children, callback, thisArg) {
			if (children != null)
				arrayChildren(children).forEach(callback, thisArg)
		}
		
		/**
		 * @alias Children#map
		 * @memberof Children
		 * @param {any} children
		 * @param {function} callback
		 * @return {Array<any>}
		 * @public
		 */
		function mapChildren (children, callback, thisArg) {
			return children != null ? arrayChildren(children).map(callback, thisArg) : children
		}
		
		/**
		 * @alias Children#filter
		 * @memberof Children
		 * @param {any} children
		 * @param {function} callback
		 * @param {any} thisArg
		 * @public
		 */
		function filterChildren (children, callback, thisArg) {
			return children != null ? arrayChildren(children).filter(callback, thisArg) : children
		}
		
		/**
		 * @alias Children#find
		 * @memberof Children
		 * @param {any} children
		 * @param {function} callback
		 * @param {any} thisArg
		 * @public
		 */
		function findChildren (children, callback, thisArg) {
			return children != null ? find(arrayChildren(children), callback, thisArg) : children
		}
		
		/**
		 * @alias Children#count
		 * @memberof Children
		 * @param {any} children
		 * @return {number}
		 * @public
		 */
		function countChildren (children) {
			return arrayChildren(children).length
		}
		
		/**
		 * @throws {Error} if not a single valid element
		 * @alias Children#only
		 * @memberof Children
		 * @param {any} children
		 * @return {Element?}
		 * @public
		 */
		function onlyChildren (children) {
			return isValidElement(children) ? children : invariant('Children.only', 'Expected to receive a single element')
		}
		
		/**
		 * @param {(string|function|object)} type
		 * @return {(function|object)}
		 * @public
		 */
		function createFactory (type) {
			if (type !== null && typeof type === 'object' && !thenable(type))
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
		 * @name Exception
		 * @constructor
		 * @param {Element} element
		 * @param {any} err
		 * @param {string} origin
		 * @property {any} error
		 * @property {string} origin
		 * @property {boolean} bubbles
		 */
		function Exception (element, err, origin) {
			this.error = err
			this.origin = origin
			this.bubbles = true
			this[SymbolForElement] = element
		}
		ObjectDefineProperties(Exception[SharedSitePrototype], {
			/**
			 * @alias Exception#toString
			 * @memberof Exception
			 * @type {function}
			 * @return {string}
			 */
			toString: {
				value: function () {
					return this.message
				}
			},
			/**
			 * @alias Exception#message
			 * @memberof Exception
			 * @type {string}
			 */
			message: {
				get: function () {
					return this[SymbolForCache] = this[SymbolForCache] || (
						'Exception: ' + Object(this.error).toString() + '\n\n' +
						'The following error occurred in `\n' +
						this.componentStack + '` from "' + this.origin + '"'
					)
				}
			},
			/**
			 * @alias Exception#componentStack
			 * @memberof Exception
			 * @type {string}
			 */
			componentStack: {
				get: function () {
					return this[SymbolForComponent] = this[SymbolForComponent] || (
						createErrorStack(this[SymbolForElement].host, '<'+getDisplayName(this[SymbolForElement])+'>\n')
					)
				}
			}
		})
		
		/**
		 * @param {Element} element
		 * @param {any} err
		 * @param {string} origin
		 * @return {Exception}
		 */
		function createErrorException (element, err, origin) {
			return new Exception(element, err, origin)
		}
		
		/**
		 * @throws Exception
		 * @param {Element} element
		 * @param {any} err
		 * @param {string} origin
		 */
		function throwErrorException (element, err, origin) {
			throw createErrorException(element, err, origin)
		}
		
		/**
		 * @throws {any}
		 * @param {Element} element
		 * @param {any} err
		 * @param {string} origin
		 */
		function reportErrorException (element, err, origin) {
			throw printErrorException(createErrorException(element, err, origin))
		}
		
		/**
		 * @param {(Exception|string)} exception
		 * @return {any}
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
		 * @param {any} err
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
			if (owner && owner[SharedComponentDidCatch] && !owner[SymbolForException])
				owner[SymbolForException] = getLifecycleBoundary(element, owner, owner[SymbolForException] = exception)
		}
		
		/**
		 * @throws {Exception} throws when an ErrorBoundary is not found.
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
		 * @alias Element#handleEvent
		 * @memberof Element
		 * @this {Element}
		 * @param {Event}
		 */
		function handleEvent (event) {
			var element = this
			var callback = getNodeListener(element, event)
		
			if (!callback)
				return
		
			if (typeof callback === 'object')
				if (callback[SymbolForIterator] || ArrayIsArray(callback))
					return iterate(callback, function (callback) {
						dispatchEvent(element, event, callback)
					})
		
			dispatchEvent(element, event, callback)
		}
		
		/**
		 * @param {Element} element
		 * @param {Event} event
		 * @param {(function|object)?} callback
		 */
		function dispatchEvent (element, event, callback) {
			try {
				var host = element.host
				var owner = host.owner
				var props = owner.props
				var state = owner.state
				var context = owner.context
				var value
		
				if (typeof callback === 'function') {
					value = callback.call(owner, event, props, state, context)
				} else if (typeof callback.handleEvent === 'function') {
					if (owner !== callback && callback[SymbolForComponent])
						host = (owner = callback)[SymbolForElement]
		
					value = callback.handleEvent(event, props, state, context)
				}
		
				if (value && owner[SymbolForComponent])
					enqueueComponentValue(host, SharedSiteEvent, value)
			} catch (err) {
				reportErrorException(host, err, SharedSiteEvent+':'+getDisplayName(callback.handleEvent || callback))
			}
		}
		
		/**
		 * @name Component
		 * @constructor
		 * @param {object} props
		 * @param {object} context
		 * @property {object} refs
		 * @property {object} state
		 * @property {object} props
		 * @property {object} context
		 * @public
		 */
		function Component (props, context) {
			this.refs = {}
			this.state = {}
			this.props = props
			this.context = context
		}
		Component[SharedSitePrototype] = createComponentPrototype(Component[SharedSitePrototype])
		
		/**
		 * @type {symbol}
		 * @public
		 */
		var Fragment = SymbolForFragment
		
		/**
		 * @name PureComponent
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 * @public
		 */
		function PureComponent (props, context) {
			Component.call(this, props, context)
		}
		PureComponent[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
			/**
			 * @alias PureComponent#shouldComponentUpdate
			 * @memberof PureComponent
			 * @type {function}
			 * @this {Component}
			 * @param {object} props
			 * @param {object} state
			 * @return {boolean}
			 */
			shouldComponentUpdate: {
				value: function (props, state) {
					return compare(this.props, props) || compare(this.state, state)
				}
			}
		})
		
		/**
		 * @name CustomComponent
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 */
		function CustomComponent (props, context) {
			Component.call(this, props, context)
		}
		CustomComponent[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
			/**
			 * @alias CustomComponent#render
			 * @memberof CustomComponent
			 * @type {function}
			 * @this {Component}
			 * @param {object} props
			 * @return {Element}
			 */
			render: {
				value: function (props) {
					return createElementComponent(disableRef(this[SymbolForElement], noop).type, props)
				}
			}
		})
		
		/**
		 * @alias Component#setState
		 * @memberof Component
		 * @this {Component}
		 * @param {(object|function)} state
		 * @param {function?} callback
		 */
		function setState (state, callback) {
			enqueueComponentUpdate(this[SymbolForElement], this, state, SharedComponentStateUpdate, callback)
		}
		
		/**
		 * @alias Component#forceUpdate
		 * @memberof Component
		 * @this {Component}
		 * @param {function} callback
		 */
		function forceUpdate (callback) {
			enqueueComponentUpdate(this[SymbolForElement], this, {}, SharedComponentForceUpdate, callback)
		}
		
		/**
		 * @param {object} description
		 * @return {function}
		 * @public
		 */
		function createClass (description) {
			return createComponentClass(Object(description), function constructor () {
				for (var i = 0, keys = ObjectKeys(constructor[SharedSitePrototype]); i < keys.length; ++i)
					this[keys[i]] = this[keys[i]].bind(this)
			})
		}
		
		/**
		 * @param {object} description
		 * @param {function} constructor
		 * @return {function}
		 */
		function createComponentClass (description, constructor) {
			if (description[SymbolForComponent])
				return description[SymbolForComponent]
		
			if (typeof description === 'function' && !description[SharedSiteRender])
				return createComponentClass(description[SharedSiteRender] = description, constructor)
		
			if (description[SharedSiteDisplayName])
				constructor[SharedSiteDisplayName] = description[SharedSiteDisplayName]
		
			if (description[SharedGetDefaultProps])
				constructor[SharedDefaultProps] = description[SharedGetDefaultProps]
		
			for (var name in description)
				description[name] = getComponentDescriptor(name, description[name])
		
			constructor[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], description)
		
			return description[SymbolForComponent] = constructor
		}
		
		/**
		 * @param {object} prototype
		 * @return {object}
		 */
		function createComponentPrototype (prototype) {
			ObjectDefineProperty(prototype, SymbolForComponent, {value: SymbolForComponent})
			ObjectDefineProperty(prototype, SharedSiteSetState, {value: setState})
			ObjectDefineProperty(prototype, SharedSiteForceUpdate, {value: forceUpdate})
		
			if (!prototype[SharedSiteRender])
				ObjectDefineProperty(prototype, SharedSiteRender, getComponentDescriptor(SharedSiteRender, noop))
		
			return prototype
		}
		
		/**
		 * @param {function} type
		 * @return {function}
		 */
		function getComponentClass (type) {
			if (!type[SharedSitePrototype] || !type[SharedSitePrototype][SharedSiteRender])
				if (type[SymbolForComponent])
					return type[SymbolForComponent]
				else if (isValidNodeComponent(type))
					return type[SymbolForComponent] = CustomComponent
				else
					return createComponentClass(type, function () {})
		
			if (!type[SharedSitePrototype][SymbolForComponent])
				createComponentPrototype(type[SharedSitePrototype])
		
			return type
		}
		
		/**
		 * @param {string} name
		 * @param {any} value
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
			owner[SymbolForState] = owner[SymbolForCache] = {}
			owner[SymbolForContext] = element.cache = host.cache
			owner[SymbolForElement] = element
		
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
		 * @return {Promise<any>?}
		 */
		function unmountComponentInstance (element) {
			if (element.owner[SharedComponentWillUnmount])
				if (element.cache = getLifecycleUnmount(element, SharedComponentWillUnmount))
					if (thenable(element.cache))
						return void element.cache.catch(function (err) {
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
			var tempState = owner[SymbolForState] = owner[SymbolForCache]
			var nextState = prevState
		
			switch (signature) {
				case SharedComponentPropsUpdate:
					if (owner[SharedComponentWillReceiveProps])
						getLifecycleUpdate(element, SharedComponentWillReceiveProps, element.props = nextProps, nextContext, nextState)
		
					if (tempState !== owner[SymbolForCache])
						break
				case SharedComponentForceUpdate:
					tempState = nextState
			}
		
			nextState = owner[SymbolForState] = tempState !== nextState ? assign({}, prevState, tempState) : nextState
		
			if (signature !== SharedComponentForceUpdate)
				if (owner[SharedComponentShouldUpdate])
					if (!getLifecycleUpdate(element, SharedComponentShouldUpdate, nextProps, nextState, nextContext))
						return void(owner.state = nextState)
		
			if (owner[SharedComponentWillUpdate])
				getLifecycleUpdate(element, SharedComponentWillUpdate, nextProps, nextState, nextContext)
		
			switch (signature) {
				case SharedComponentPropsUpdate:
					element.props = nextProps
				case SharedComponentStateUpdate:
					owner.state = nextState
				case SharedComponentForceUpdate:
					owner.props = element.props
			}
		
			if (owner[SharedGetChildContext])
				merge(element.context, getLifecycleUpdate(element, SharedGetChildContext, nextProps, nextState, nextContext))
		
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
					if (owner[SymbolForException])
						reject(owner[SymbolForException])
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
				return generator.next(element.cache).then(function (sequence) {
					if (sequence.done !== true || sequence.value !== undefined)
						resolve(element.cache = sequence.value, sequence.done, then(resolve, reject))
					else if (element.context)
						resolve(element.cache, sequence.done)
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
						if (thenable(owner[SymbolForCache] = state))
							return enqueueStatePromise(element, owner, state, signature, callback)
		
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
				merge(owner.state, owner[SymbolForCache])
			else if (element.work === SharedWorkUpdating && signature === SharedComponentStateUpdate)
				merge(owner[SymbolForState], owner[SymbolForCache])
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
		 * @param {Promise<object>} state
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
					owner[SymbolForException] = createErrorException(element, err, SharedSiteSetState)
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
		 */
		function getLifecycleCallback (element, callback) {
			try {
				if (typeof callback === 'function')
					callback.call(element.owner)
			} catch (err) {
				throwErrorException(element, err, SharedSiteCallback)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {object?} owner
		 * @param {any?} value
		 */
		function getLifecycleRefs (element, owner, value) {
			try {
				if (element.id === SharedElementComponent && typeof element.xmlns === 'function')
					return
		
				switch (typeof value) {
					case 'object':
						return value.current = owner
					case 'function':
						return value.call(element.host.owner, owner)
				}
		
				Object(element.host.owner.refs)[value] = owner
			} catch (err) {
				throwErrorException(element.host, err, SharedSiteCallback)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
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
		 * @return {any}
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
		 * @name ForwardRef
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 */
		function ForwardRef (props, context) {
			Component.call(this, props, context)
		}
		ForwardRef[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
			/**
			 * @alias ForwardRef#render
			 * @memberof ForwardRef
			 * @type {function}
			 * @param {object} props
			 * @return {Element}
			 */
			render: {
				value: function (props) {
					return this[SymbolForElement].xmlns(props, props.ref)
				}
			}
		})
		
		/**
		 * @param {Element} element
		 * @param {function} xmlns
		 * @return {Element}
		 */
		function disableRef (element, xmlns) {
			return merge(element, {xmlns: xmlns})
		}
		
		/**
		 * @param {function} children
		 * @return {function}
		 */
		function forwardRef (children) {
			return disableRef(createElement(ForwardRef), children)
		}
		
		/**
		 * @return {object}
		 */
		function createRef () {
			return {current: null}
		}
		
		/**
		 * @name ContextProvider
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 */
		function ContextProvider (props, context) {
			Component.call(this, props, context)
		}
		ContextProvider[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
			/**
			 * @alias ContextProvider#getInitialState
			 * @memberof ContextProvider
			 * @type {function}
			 * @this {Component}
			 * @param {object} props
			 * @param {object} state
			 * @param {object} context
			 * @return {object}
			 */
			getInitialState: {
				value: function (props, state, context) {
					return this[SymbolForElement].cache = {provider: this, consumers: new List()}
				}
			},
			/**
			 * @alias ContextProvider#render
			 * @memberof ContextProvider
			 * @type {function}
			 * @this {Component}
			 * @param {object} props
			 * @return {any}
			 */
			render: {
				value: function (props) {
					return props.children
				}
			},
			/**
			 * @alias ContextProvider#componentDidUpdate
			 * @memberof ContextProvider
			 * @type {function}
			 * @this {Component}
			 * @param {object} props
			 * @param {object}
			 */
			componentDidUpdate: {
				value: function (props) {
					!is(this.props.value, props.value) && this.state.consumers.forEach(this.componentChildUpdate)
				}
			},
			/**
			 * @alias ContextProvider#componentChildUpdate
			 * @memberof ContextProvider
			 * @type {function}
			 * @param {Component} consumer
			 */
			componentChildUpdate: {
				value: function (consumer) {
					consumer.didUpdate = consumer.didUpdate ? false : !!consumer[SharedSiteForceUpdate]()
				}
			}
		})
		
		/**
		 * @name ContextConsumer
		 * @constructor
		 * @extends Component
		 * @param {object} props
		 * @param {object} context
		 */
		function ContextConsumer (props, context) {
			Component.call(this, props, context)
		}
		ContextConsumer[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
			/**
			 * @alias ContextConsumer#getInitialState
			 * @memberof ContextConsumer
			 * @type {function}
			 * @this {Component}
			 * @param {object} props
			 * @return {object}
			 */
			getInitialState: {
				value: function (props) {
					return this[SymbolForContext] || {provider: this}
				}
			},
			/**
			 * @alias ContextConsumer#render
			 * @memberof ContextConsumer
			 * @type {function}
			 * @this {Component}
			 * @param {object} props
			 * @param {object} state
			 * @return {any}
			 */
			render: {
				value: function (props, state) {
					return props.children(state.provider.props.value)
				}
			},
			/**
			 * @alias ContextConsumer#componentWillReceiveProps
			 * @memberof ContextConsumer
			 * @type {function}
			 * @this {Component}
			 */
			componentWillReceiveProps: {
				value: function () {
					this.didUpdate = true
				}
			},
			/**
			 * @alias ContextConsumer#componentDidMount
			 * @memberof ContextConsumer
			 * @type {function}
			 * @this {Component}
			 */
			componentDidMount: {
				value: function () {
					this.state.consumers && this.state.consumers.insert(this, this.state.consumers)
				}
			},
			/**
			 * @alias ContextConsumer#componentWillUnmount
			 * @memberof ContextConsumer
			 * @type {function}
			 * @this {Component}
			 */
			componentWillUnmount: {
				value: function () {
					this.state.consumers && this.state.consumers.remove(this)
				}
			}
		})
		
		/**
		 * @param {any} value
		 * @return {{Provider, Consumer}}
		 * @public
		 */
		function createContext (value) {
			return {
				/**
				 * @type {Element}
				 */
				Provider: createElement(ContextProvider, {value: value}),
				/**
				 * @type {Element}
				 */
				Consumer: createElement(ContextConsumer, {value: value, children: noop})
			}
		}
		
		/**
		 * @param {any} element
		 * @return {(object|boolean)?}
		 * @public
		 */
		function findDOMNode (element) {
			if (!element)
				return
		
			if (isValidElement(element[SymbolForElement]))
				return findDOMNode(element[SymbolForElement])
		
			if (isValidElement(element))
				return element.active && getNodeOwner(getElementDescription(element))
		
			if (isValidNodeEvent(element))
				return getNodeTarget(element)
		
			if (isValidNodeTarget(element))
				return element
		}
		
		/**
		 * @param {any} element
		 * @param {object} container
		 * @param {function?} callback
		 * @public
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
		 * @param {any} element
		 * @param {object} container
		 * @param {function?} callback
		 * @public
		 */
		function hydrate (element, container, callback) {
			if (!container)
				hydrate(element, getNodeDocument(), callback)
			else
				mountContainerElement(element, container, callback, SharedMountQuery)
		}
		
		/**
		 * @param {object} container
		 * @return {boolean}
		 * @public
		 */
		function unmountComponentAtNode (container) {
			return registry.has(container) && !render(null, container)
		}
		
		/**
		 * @throws {Error} if invoked with an invalid container
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
					commitMountElementComponent(element, sibling, parent, host, operation, signature)
		
					return
				case SharedElementPromise:
					commitMountElementPromise(element, host, element.type)
				case SharedElementFragment:
					element.owner = parent.owner
		
					commitMountElementChildren(element, sibling, host, operation, signature)
					commitOwner(element)
		
					return
				case SharedElementPortal:
					element.owner = getNodePortal(element, element.type)
		
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
			commitOwnerPropsInitial(element, element.props)
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
		 * @param {Promise<any>} type
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
		function commitMountElementComponent (element, sibling, parent, host, operation, signature) {
			try {
				commitMountElement(mountComponentInstance(element), sibling, parent, element, operation, signature)
				commitOwner(element)
		
				if (element.owner[SharedComponentDidMount])
					getLifecycleMount(element, SharedComponentDidMount, element.owner)
		
				if (element.ref)
					commitOwnerRefs(element, element.ref, SharedRefsDispatch)
			} catch (err) {
				commitMountElementReplace(host.children, getElementDefinition(commitOwner(host)), host)
				delegateErrorBoundary(element, host, err)
			}
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
					if (element.children)
						commitUnmountElementComponent(element, parent, host, element.children)
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
		 * @param {Element} children
		 */
		function commitUnmountElementComponent (element, parent, host, children) {
			commitUnmountElementChildren(children, parent, element !== host ? host : children)
			unmountComponentInstance(element)
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
		 * @param {any?} value
		 * @param {number} signature
		 */
		function commitOwnerRefs (element, value, signature) {
			switch (typeof value) {
				case 'object':
					if (value)
						break
				case 'undefined':
					return commitOwnerRefs(element, element.ref === value ? noop : element.ref, SharedRefsRemove)
			}
		
			switch (signature) {
				case SharedRefsRemove:
					return getLifecycleRefs(element, element.ref = null, value)
				case SharedRefsAssign:
					element.ref = value
				case SharedRefsDispatch:
					return getLifecycleRefs(element, element.owner, value)
				case SharedRefsReplace:
					commitOwnerRefs(element, element.ref, SharedRefsRemove)
					commitOwnerRefs(element, value, SharedRefsAssign)
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
						setNodeProps(element, key, props[key], xmlns, signature)
				}
		}
		
		/**
		 * @param {Element} element
		 * @param {object} props
		 */
		function commitOwnerPropsInitial (element, props) {
			commitOwnerProps(element, getNodeInitialProps(element, props), element.xmlns, SharedPropsInitial)
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
		 * @param {object} older
		 * @param {object} newer
		 * @return {object?}
		 */
		function reconcileElementProps (older, newer) {
			if (older === newer)
				return
		
			var length = 0
			var change = {}
		
			for (var key in older)
				if (!ObjectHasOwnProperty.call(newer, key))
					change[(++length, key)] = null
		
			for (var key in newer) {
				var next = newer[key]
				var prev = older[key]
		
				if (next !== prev)
					// primitive
					if (typeof next !== 'object' || next === null)
						change[(++length, key)] = next
					// object/circular data-structure
					else if (next === newer || next[SymbolForIterator] === SymbolForIterator || (next = reconcileElementProps(prev || {}, next)))
						change[(++length, key)] = next
			}
		
			if (length > 0)
				return change
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
			if (typeof value !== 'object')
				return setDOMAttribute(element, name, value, '')
		
			for (var property in value) {
				var declaration = value[property]
		
				if (property.indexOf('-') === -1)
					element.owner.style[property] = declaration !== false && declaration !== undefined ? declaration : ''
				else
					element.owner.style.setProperty(property, declaration)
			}
		}
		
		/**
		 * @param {Element} element
		 * @param {string} name
		 * @param {any} value
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
		 * @param {any} value
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
		 * @param {any} value
		 * @param {string?} xmlns
		 * @param {number} signature
		 */
		function setDOMProps (element, name, value, xmlns, signature) {
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
					return setDOMProps(element, 'innerHTML', value && value.__html, xmlns, signature)
				case 'acceptCharset':
					return setDOMProps(element, 'accept-charset', value, xmlns, signature)
				case 'httpEquiv':
					return setDOMProps(element, 'http-equiv', value, xmlns, signature)
				case 'tabIndex':
					return setDOMProps(element, name.toLowerCase(), value, xmlns, signature)
				case 'autofocus':
				case 'autoFocus':
					return element.owner[value ? 'focus' : 'blur']()
				case 'defaultValue':
					if (element.type === 'select')
						return
					break
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
		 * @param {Array<Node>} nodes
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
		 * @return {Node}
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
			}
		
			return xmlns
		}
		
		/**
		 * @param {Element} element
		 * @param {object} props
		 * @return {object?}
		 */
		function getDOMInitialProps (element, props) {
			switch (element.type) {
				case 'input':
					return merge({type: null, step: null, min: null, max: null}, props)
				case 'select':
					if (props.defaultValue != null || props.multiple)
						return merge({value: props.defaultValue}, props)
			}
		
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
		 * @param {any?} container
		 * @return {Node}
		 */
		function getDOMPortal (element, container) {
			if (typeof container === 'string')
				return getDOMDocument().querySelector(container)
		
			if (isValidDOMTarget(container))
				return container
		
			return getDOMDocument()
		}
		
		/**
		 * @param {Element} element
		 * @param {Element} parent
		 * @param {Element} previousSibling
		 * @param {Element} nextSibling
		 * @return {Node?}
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
						getDOMPortal(parent, parent.type).appendChild(target)
		
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
		 * @return {Node}
		 */
		function createDOMText (element) {
			return document.createTextNode(element.children)
		}
		
		/**
		 * @param {Element} element
		 * @return {Node}
		 */
		function createDOMEmpty (element) {
			return document.createTextNode('')
		}
		
		/**
		 * @param {Element} element
		 * @return {Node}
		 */
		function createDOMComment (element) {
			return document.createComment(element.children)
		}
		
		/**
		 * @param {Element} element
		 * @return {Node}
		 */
		function createDOMElement (element) {
			return element.xmlns ? document.createElementNS(element.xmlns, element.type) : document.createElement(element.type)
		}
		
		/**
		 * @param {Element} element
		 * @return {Node}
		 */
		function createDOMComponent (element) {
			return new element.type(element.props)
		}
		
		dio.render = render
		dio.hydrate = hydrate
		dio.Component = Component
		dio.Fragment = Fragment
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
		dio.createRef = createRef
		dio.forwardRef = forwardRef
		dio.unmountComponentAtNode = unmountComponentAtNode
		dio.findDOMNode = findDOMNode
		dio.h = createElement
		
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

export var render = dio.render
export var hydrate = dio.hydrate
export var Component = dio.Component
export var Fragment = dio.Fragment
export var PureComponent = dio.PureComponent
export var Children = dio.Children
export var createContext = dio.createContext
export var createFactory = dio.createFactory
export var cloneElement = dio.cloneElement
export var isValidElement = dio.isValidElement
export var createPortal = dio.createPortal
export var createElement = dio.createElement
export var createComment = dio.createComment
export var createClass = dio.createClass
export var createRef = dio.createRef
export var forwardRef = dio.forwardRef
export var unmountComponentAtNode = dio.unmountComponentAtNode
export var findDOMNode = dio.findDOMNode
export var h = dio.h

export default dio
/*!/dio*/
