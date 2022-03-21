/** Enum **/
// 0x0 = type
// 0x1 = props
// 0x2 = children
// 0x3 = node
// 0x4 = state/reference
var status
var future
var server
var active
var memory
var column = 1
/** Utility **/
var identifier = '@@identifier'
var call = Function.prototype.call
var bind = call.bind(call.bind)
var error = Error
var array = Array
var object = Object
var string = String
var promise = Promise
var all = bind(promise.all, promise)
var resolve = bind(promise.resolve, promise)
var is = object.is
var create = object.create
var assign = object.assign
var defineProperty = object.defineProperty
var hasOwnProperty = bind(call, object.prototype.hasOwnProperty)
var isArray = array.isArray
var slice = bind(call, array.prototype.slice)
var split = bind(call, string.prototype.split)
var replace = bind(call, string.prototype.replace)
var identity = (value) => value
var throws = (value) => { throw value }
var eventually = (callback, value) => new promise((resolve) => requestAnimationFrame(() => resolve(callback(value))) )
var immediately = (callback, value) => resolve(value).then(callback, null)
var print = (value) => { try { typeof reportError === 'function' ? reportError(value) : console.error('' + value) } finally { return value } }
var thenable = (value) => value instanceof promise
var fetchable = (value) => typeof object(value).json === 'function' ? value.json() : defaults(value)
var defaults = (value) => object(value).default || value
var then = (value, resolve, reject) => isArray(value) ? than(value, value.length).then(resolve, reject) : value.then(resolve, reject)
var than = (value, length) => promise.all(value).then(() => value.length === length ? null : than(value = value.slice(length), value.length), null)
var noop = () => {}
/** Render **/
function render (value, node) {
	value = [null, null, [STYLESHEET, value], node = documentSelector(node)]
	if (hasOwnProperty(node, identifier)) reconcileElement(active = node[identifier], node, active, value, 0, null, null)
	else node[identifier] = attachNode(value, node, value, null)
	return future ? then(future, identity) : resolve(node)
}
function update (value) { component(element[0x5] = value) }
function queued (value) { return future = !future ? value : then([future, value], function () { return future = null, value }, function () { return future = null, throws(value) }) }
/** Component **/
function like (a, b) {
	if (a !== b) {
		for (var key in a) if (!hasOwnProperty(b, key)) return 0
		for (var key in b) if (!is(a[key], b[key])) return 0
	}
	return 1
}
function lazy (value) { return [useResource(value[0x0], []), value[0x1], value[0x2]] }
function memo (value) { return [useMemo(value[0x0], like), value[0x1], value[0x2]] }
function context (props) { return memory[1] = props.value, props.children }
function boundary (props) { return props.children }
function suspense (props) { return props.children }
function component (element) {
	var children = element[0x2]
	var namespace = children[2]
	if (namespace) reconcileElement(element, children[1], element, element, 0, children, namespace)
}
/** Element **/
function createMemo (type, props, children) { return [memo, [type, props, children], null] }
function createLazy (type, props, children) { return [lazy, [type, props, children], null] }
function createContext (props, children) { return [context, props, children] }
function createBoundary (props, children) { return [boundary, props, children] }
function createSuspense (props, children) { return [suspense, props, children] }
function createFragment (children) { ['fragment', '', children] }
function createProperties (value) {
	if (!value) return value
	var values = value.match(/(?:[^\s;"']+|(["']).*?\1)+/g)
	var length = values.length
	var object = {}
	while (length--) object[(value = split(values[length], /=|:/, 2))[0]] = replace(value[1], /^["']|["']$/g, '')
	return object
}
function createStylesheet (value) {
	if (!value) return value
	var values = value.match(/(?:[^;"']+|(["']).*?\1)+/g)
	var length = values.length
	var object = {}
	while (length--) object[(value = split(values[length], /:/, 2))[0]] = value[1]
	return object
}
/** Reconcile **/
function reconcileElement (host, node, element, snapshot, index, children, namespace) {
	var type = element[0x0]
	if (type === snapshot[0x0]) {
		var a = element[0x2]
		var b = snapshot[0x2]
		var props = snapshot[0x1]
		if (typeof props === 'string') props = createProperties(props)
		switch (typeof type) {
			case 'object': namespace = element[0x0]
			case 'string': node = element[0x3]
				switch (type) {
					case 'text': if (a !== b) element[0x2] = node.textContent = b
						break
					case 'each': reconcileChildren(host, node, a, b || '', namespace)
						break
					default:
						if (!b) b = ''
						var size = a.length
						if (size === b.length) for (index = 0; index < size; ++index) reconcileElement(host, node, a[index], b[index], index, a, namespace)
						else reconcileChildren(host, node, a, b, namespace)
				}
				if ((a = element[0x1]) === (b = element[0x1] = props)) break
				var name, prop
				for (name in a) if (!hasOwnProperty(b, name)) documentProperties(type, name, null, node, true, host, element)
				for (name in b) if (a[name] !== (prop = b[name])) documentProperties(type, name, prop, node, true, host, element)
				return node
			case 'function':
				if (b !== undefined) props.children = b
				active = element
				memory = children
				column = 1
				try {
					return reconcileElement(element, node, type(props) || text(''), 0, a, namespace)
				} catch (error) {
					dispatchException(error, element, status = '')
				} finally {
					element[0x1] = props
				}
		}
	} else {
		node.replaceChild(node = attachNode(host, node, children[index] = snapshot, namespace), detachNode(snapshot, node, element))
	}
	return node
}
function reconcileChildren (host, node, a, b, namespace) {
	var apos = 0
	var bpos = 0
	var aidx = 0
	var bidx = 0
	var alen = a.length
	var blen = b.length
	if (alen + blen === 0) return
	var aend = alen - 1
	var bend = blen - 1
	var ahead = a[aidx]
	var bhead = b[bidx]
	var atail = a[aend]
	var btail = b[bend]
	var amove
	var akeys
	var bkeys
	var delta = 0

	while (1) {
		// step 1, common prefix/suffix/affix(rl)/affix(lr)
		outer: if (alen * blen !== 0) {
			while ((ahead)[0x1].key === (bhead)[0x1].key) {
				reconcileElement(host, node, ahead, bhead, aidx, a, namespace)
				if (++aidx > aend | ++bidx > bend) break outer
				ahead = a[aidx]
				bhead = b[bidx]
			}
			while ((atail)[0x1].key === (btail)[0x1].key) {
				reconcileElement(host, node, atail, btail, aend, a, namespace)
				if (aidx > --aend | bidx > --bend) break outer
				atail = a[aend]
				btail = b[bend]
			}
			if ((atail)[0x1].key === (bhead)[0x1].key) {
				amove = reconcileElement(host, node, atail, bhead, aidx, a, namespace)
				aidx < alen ? node.insertBefore(amove, returnNode(a[aidx])) : node.appendChild(amove)
				a.splice(aend, 1)
				a.splice(aidx, 0, atail)
				delta = delta + 1
				ahead = a[++aidx]
				atail = a[aend]
				bhead = b[++bidx]
				continue
			}
			if ((ahead)[0x1].key === (btail)[0x1].key) {
				amove = reconcileElement(host, node, ahead, btail, aend, a, namespace)
				aend + 1 < alen ? node.insertBefore(amove, returnNode(a[aend + 1])) : node.appendChild(amove)
				a.splice(aidx, 1)
				a.splice(aend, 0, ahead)
				delta = delta - 1
				atail = a[--aend]
				ahead = a[aidx]
				btail = b[--bend]
				continue
			}
		}
		// step 2, noop/mount/unmount/replace
		if (aidx > aend) {
			if (bidx <= bend) {
				if (aend + 1 < alen) {
					atail = returnNode(a[aend + 1])
					while (bidx <= bend) {
						node.insertBefore(attachNode(host, node, btail = b[bidx], namespace), atail)
						a.splice(bidx++, 0, btail)
					}
				} else {
					while (bidx <= bend) {
						node.appendChild(attachNode(host, node, btail = b[bidx], namespace))
						a.splice(bidx++, 0, btail)
					}
				}
			}
		} else if (bidx > bend) {
			while (aidx <= aend) {
				node.removeChild(detachNode(host, node, a[aend]))
				a.splice(aend--, 1)
			}
		} else if (((apos = aend + 1) - aidx) * ((bpos = bend + 1) - bidx) === 1) {
			node.replaceChild(attachNode(host, node, bhead, namespace), detachNode(host, node, ahead))
		} else {
			// step 3, keymap/unmount(rl)/unmount(lr)/mount(rl)/move(rl/lr)
			if (akeys === bkeys) {
				akeys = {}
				bkeys = {}
				delta = 0
				while (apos > aidx | bpos > bidx) {
					if (apos > aidx) akeys[(a[--apos])[0x1].key] = apos
					if (bpos > bidx) bkeys[(b[--bpos] = b[bpos])[0x1].key] = bpos
				}
			}
			if (bkeys[(atail)[0x1].key] === undefined) {
				node.removeChild(detachNode(host, node, atail))
				alen = alen - 1
				atail = aend > 0 ? a[aend - 1] : a[aend + 1]
				a.splice(aend--, 1)
			} else if (bkeys[(ahead)[0x1].key] === undefined) {
				node.removeChild(detachNode(host, node, ahead))
				alen = alen - 1
				aend = aend - 1
				delta = delta - 1
				a.splice(aidx, 1)
				ahead = a[aidx + 1]
			} else if (akeys[(bhead)[0x1].key] === undefined) {
				node.insertBefore(attachNode(host, node, bhead, namespace), returnNode(ahead))
				alen = alen + 1
				aend = aend + 1
				delta = delta + 1
				a.splice(aidx, 0, bhead)
				ahead = a[++aidx]
				bhead = b[++bidx]
			} else {
				apos = akeys[(ahead)[0x1].key] = akeys[(bhead)[0x1].key]
				apos = apos + delta
				node.insertBefore(reconcileElement(host, node, amove = a[apos], bhead, aidx, a, namespace), bhead = returnNode(ahead))
				a[aidx] = amove
				node.insertBefore(bhead, apos + 1 < alen ? returnNode(a[apos + 1]) : null)
				a[apos] = ahead
				ahead = a[++aidx]
				bhead = b[++bidx]
			}
			continue
		}
		break
	}
}
/** Context **/
function contextSelector (element, value) {
	while (element = element[0x3]) {
		switch (element[0x0]) {
			case null: throws(error('Invalid Provider!'))
			case context: if (element[0x3][0x0] === value) return element[0x2]
		}
	}
}
/** Hooks **/
function same (a, b) {
	if (a !== b) for (var index = 0; index < a.length; index++) if (!is(a[index], b[index])) return 0
	return 1
}
function useMemo (callback, value) {
	var element = active
	var children = memory
	if (++column === children.length) children = children[column] = [value || [], callback(value)]
	else if (!same((children = children[column])[0], children[0] = value || [])) children[1] = callback(value)
	return children[1]
}
function useState (value) {
	var element = active
	var children = memory
	if (++column === children.length) children = children[column] = [[typeof value === 'function' ? value() : value, function (value) { attachUpdate(value, element, children) }]]
	else children = children[column]
	return children[0]
}
function useReducer (callback, value) {
	var element = active
	var children = memory
	if (++column === children.length) children = children[column] = [[typeof value === 'function' ? value() : value, function (value) { dispatchUpdate(children[1](children[0][0], value), element, children) }], callback]
	else children = children[column], children[1] = callback
	return children[0]
}
function useCallback (callback, value) {
	var element = active
	var children = memory
	if (++column === children.length) children = children[column] = [value || [], callback]
	else if (!same((children = children[column])[0], children[0] = value || [])) children[1] = callback
	return children[1]
}
function useContext (value) {
	var element = active
	var children = memory
	if (++column === children.length) children = children[column] = contextSelector(element, value)
	else children = children[column]
	return children[1]
}
function useResource (callback, value) {
	var element = active
	var children = memory
	if (++column === children.length) children = children[column] = [value || [], null]
	else if (same((children = children[column])[0], children[0] = value || [])) return children[1][0]
	throws(children[1] = then(typeof callback === 'function' ? callback(children[0]) : fetch(callback), fetchable, null))
}
function useLayout (callback, value) { handleEffect(callback, value, true) }
function useEffect (callback, value) { handleEffect(callback, value, false) }
// update/effect
function attachUpdate (value, element, children) {
	if (is(children[0][0], typeof value === 'function' ? value = value(children[0][0]) : value)) return
	children[0] = [value, children[0][1]]
	if (thenable(element[0x5])) return
	else element[0x5] = immediately(update, element)
}
function handleEffect (callback, value, type) {
	var element = active
	var children = memory
	if (++column === children.length) children = children[column] = [element, callback, value || [{}], -1]
	else if (same((children = children[column])[2], children[2] = value || [{}])) return
	else children[1] = callback
	queued(type ? immediately(attachEffect, children) : eventually(attachEffect, children))
}
function attachEffect (value) {
	if (value[0][0x2][2] === null) return
	if (value[3] !== -1) value[value[3]]()
	return detachEffect(value, element[0x4] = element[0x4] || [], value[1](value[2]), value[3])
}
function detachEffect (value, state, callback, index) {
	if (!callback) return
	if (typeof callback === 'function') state[index === -1 ? value[3] = state.length : index] = callback
	else if (thenable(callback)) queued(then(callback, function (callback) { /*TODO*/detachEffect(value, state, callback, index) }, throwException(value[0])))
}
/** Exception **/
function throwException (value) {
	return function (error) { dispatchException(error, value, status = '') }
}
function traceException (value, element) {
	return isArray(element[0x3]) ? traceException(typeof element[0x0] === 'function' ? '\tat <' + element[0x0].name || 'anonymous' + '>\n' + value : value, element[0x3]) : value
}
function createException (value, element) {
	return {type: 'EXCEPTION', message: value, toString: bind(traceException, null, value, element)}
}
function dispatchException (value, element, host) {
	if (host === null) host = element[0x3]
	if (!isArray(host[0x3])) print(traceException(value, element)) | throws(value)
	if (thenable(value)) return thenableException(value, element, host)
	if (host[0x0] === boundary) host[0x1].children = h(host[0x1].fallback, createException(value, element), null)
	else throws(value)
	component(host)
}
function thenableException (value, element, host) {
	do {
		if (host[0x0] === suspense) break
		if (!isArray(host = host[0x3])) throws(value)
	} while (host)
	then(value, function (response) { try { return value[0] = response } finally { component(host) } }, function (error) { dispatchException(error, host, status = '') })
	var state = host[0x4] = host[0x4] || []
	if (state.push(value) > 1) return
	var props = host[0x1]
	var children = host[0x2]
	var sibling = children[0]
	var node = children[1]
	var namespace = children[2]
	var callback = status === null ? immediately : setTimeout
	var fallback = h(props.fallback, value, null)
	callback(function () {
		if (!children[2] || !host[0x4]) return
		node.insertBefore(attachNode(host, node, children[0] = fallback, namespace), returnNode(sibling))
		attachNode(host, node, h('offscreen', '', null), namespace).appendChild(returnNode(sibling))
	}, 100)
	queued(then(state, function () {
		state = host[0x4] = null
		if (!children[2] || !fallback[0x3]) return
		node.insertBefore(returnNode(children[0] = sibling), fallback)
		node.removeChild(fallback)
	}, null))
}
/** Event **/
function handleEvent (element, value) {
	try {
		dispatchEvent(element, value, element[0x4][value[0x0]])
	} catch (error) {
		dispatchException(error, this, status = '')
	}
}
function dispatchEvent (element, value, callback) {
	if (callback) {
		switch (typeof callback) {
			case 'function': return dispatchEvent(element, value, callback(value))
			case 'string': return thenableEvent(element, value, callback)
			case 'object':
				if (isArray(callback)) for (var index = 0; index < callback.length; ++index) dispatchEvent(element, value, callback[index])
				else if (thenable(callback)) then(callback, identity, throwException(element))
				else if (typeof callback.handleEvent === 'function') callback = dispatchEvent(element, value, callback.handleEvent(event))
		}
	}
}
function thenableEvent (element, value, callback) {
	then(import(callback), function (modules) {
		element[0x4][value[0x0]] = modules[~callback.indexOf('#') ? split(callback, '#').pop() : 'default']
		element[0x4].handleEvent(value)
	}, null)
}
/** Node **/
function attachNode (host, node, element, namespace) {
	var type = element[0x0]
	var props = element[0x1]
	var children = element[0x2]
	if (typeof props === 'string') props = element[0x1] = createProperties(props)
	switch (typeof type) {
		case 'object':
			if (namespace) namespace = documentNamespace(element[0x0], namespace)
			else if (element[0x0] = namespace = node.ownerDocument) break
		case 'string': node = element[0x3] = namespace.createElement(type)
			break
		case 'function':
			if (children !== undefined) props.children = children
			element[0x2] = children = [null, node, namespace]
			element[0x3] = host
			element[0x4] = null
			active = element
			memory = children
			column = 1
			try {
				return attachNode(element, node, children[0] = type(props) || text(''), namespace)
			} catch (error) {
				try { return attachNode(element, node, children[0] = text(''), namespace) } finally { dispatchException(error, element, status = null) }
			}
	}
	if (typeof children !== 'object') node.textContent = children
	else if (children) for (var index = 0; index < children.length; ++index) node.appendChild(attachNode(host, node, children[index], namespace))
	else children = element[0x2] = []
	if (props) for (var name in props) documentProperties(type, name, props[name], node, false, host, element)
	return node
}
function detachNode (host, node, element) {
	var type = element[0x0]
	if (type !== 'text') {
		var state = element[0x4]
		var children = element[0x2]
		if (typeof type === 'function') return state && unwindNode(host, node, element, state) || detachNode(children[2] = null, node, children[0])
		if (children) for (var index = 0; index < children.length; ++index) detachNode(null, node, children[index])
		if (typeof state === 'function') if (documentCallback(state, null, null)) return
	}
	return host && element[0x3]
}
function unwindNode (host, node, element, state) {
	var value = element[0x4] = null
	for (var index = 0; index < state.length; index++)
		if (typeof (state = state[index]) === 'function')
			if (thenable(state = state()))
				if (host) value ? value.push(state) : value = [state]
	if (value) return shadowNode(value, node, active = element)
}
function shadowNode (host, node, element) {
	then(host, function () { try { node.removeChild(returnNode(element)) } finally { return active = null } }, null)
}
function returnNode (element) {
	while (typeof element[0x0] === 'function') element = element[0x2][0]
	return element[0x3]
}
/** Document **/
function documentNamespace (value, namespace) { return {createElement: bind(value.createElement, namespace)} }
function documentCallback (value, node, element) {
	if (typeof value === 'function')
		if (value = value.call(element.props, node))
			if (element)
				switch (typeof value) {
					case 'function': element[0x4] = value
				}
}
function documentProperties (type, name, value, node, state, host, element) {
	switch (name) {
		case 'ref': if (state) documentCallback(value, node, element)
		case 'key': return
		case 'style': documentStylesheet(name, value || '', node)
		case 'children': return
	}
	if (name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 3) return documentEvent(name, value, node, host, element)
	if ((host = node[name]) === undefined) if (!(name in node)) documentAttribute(name, value, node)
	if (!value) if (value !== 0 && value !== '') value = typeof host === 'boolean' ? false : ''
	if (!state) if (value !== host) node[name] = value
}
function documentAttribute (name, value, node) {
	switch (name) {
		case 'wrap': case 'grow': case 'direction': name = 'flex-' + name
	}
	if (name in node.style) documentDeclaration(name, value, node.style)
	else if (!value && value !== 0 && value !== '') node.removeAttribute(name)
	else node.setAttribute(name, value === true ? name : value)
}
function documentStylesheet (name, value, node) {console.log(name, value, node)
	if (typeof value === 'string') value = createStylesheet(value)
	if (node = node.style) for (name in value) name in node ? node[name] = value[name] : documentDeclaration(name, value[name], node)
}
function documentDeclaration (name, value, node) {
	node.setProperty(name, value ? value : value === 0 ? 0 : '')
}
function documentEvent (name, value, node, host, element) {
	if (!element[0x4]) element[0x4] = {handleEvent: bind(handleEvent, host, element)}
	if (!element[0x4][name = name.toLowerCase().substr(2)]) node.addEventListener(name, element[0x4].handleEvent, false)
	else if (!value) node.removeEventListener(name, element[0x4].handleEvent, false)
	element[0x4][name] = value
}
function documentSelector (value) {
	if (value !== null)
		switch (typeof value) {
			case 'object': return value
			case 'string': return typeof document === 'object' ? documentSelector(document.querySelector(value)) : new DOCUMENT(value)
			case 'undefined': return documentSelector('body')
		}
	throws(error('Invalid Target!'))
}
/* Factory **/
var h = (type, props, children) => [type, children === undefined ? void(children = props) : props, children]
// view
var gap = bind(h, null, 'gap', '', null)
var row = bind(h, null, 'row')
var col = bind(h, null, 'col')
var box = bind(h, null, 'box')
var each = bind(h, null, 'each')
var flex = bind(h, null, 'flex')
var grid = bind(h, null, 'grid')
var view = bind(h, null, 'view')
// action
var text = bind(h, null, 'text')
var form = bind(h, null, 'form')
var input = bind(h, null, 'input')
var button = bind(h, null, 'button')
// embed
var style = bind(h, null, 'style', '')
var audio = bind(h, null, 'audio')
var video = bind(h, null, 'video')
var source = bind(h, null, 'source')
var picture = bind(h, null, 'picture')
// routing
var match = (props, children) => typeof location === 'undefined' || location.pathname.match(value) ? children : null
// bindings
var svg = bind(h, null, {createElement(type) { return this.createElementNS('http://www.w3.org/2000/svg', '' + type) }, toString: () => 'svg' })
var math = bind(h, null, {createElement(type) { return this.createElementNS('http://www.w3.org/1998/Math/MathML', '' + type) }, toString: () => 'math' })
var title = function (props) { return ['title', {key: props, ref: TITLE}, null] }
var portal = function (props, children) { return ['portal', {hidden: true}, ['portal', {key: props, ref: PORTAL}, children]] }
// references
var TITLE = function (value) { value.ownerDocument.title = this.key }
var PORTAL = function (value) { return (this.key = documentSelector(this.key)).appendChild(value), function (value) { this.key.removeChild(value) } }
var DOCUMENT = defineProperty(function (value) { server = value }, 'prototype', {get ownerDocument() { return this }, set textContent(value) {},
	createElement: self, createElementNS: self, querySelector: self, removeChild: noop, appendChild: noop, insertBefore: noop,
	setAttribute: noop, removeAttribute: noop, addEventListener: noop, removeEventListener: noop, style: {setProperty: noop, removeProperty: noop}})
var STYLESHEET = ['style', '', `
*{box-sizing:border-box;margin:0;}
html,body{height:100%;}
body{font:calc(1em + 0.5rem) system-ui,sans-serif;line-height:calc(1em + 0.5rem);}
picture,video,canvas,svg,iframe,object,embed{display:block;max-width:100%;}picture{vertical-align:middle;}
input,select,button{font:inherit;vertical-align:baseline;}textarea{font:inherit;vertical-align:top;resize:vertical;}
row,col,box,view,flex,grid,text{display:block;position:relative;}
gap{flex-grow:1;}
row{display:flex;flex-direction:row;}
col{display:flex;flex-direction:column;}
box{display:inline-flex;}
flex{display:flex;}
grid{display:grid;}
text{overflow-wrap:break-word;}
view{}
each,portal,fragment{display:contents;}`]
/** Exports **/
export {useMemo, useState, useReducer, useCallback, useContext, useResource, useEffect, useLayout}
export {createLazy as lazy, createMemo as memo, createContext as context, createSuspense as suspense, createBoundary as boundary, createFragment as fragment}
export {render}
export {gap, row, col, box, each, flex, grid, view}
export {text, form, input, button}
export {audio, video, source, picture}
export {svg, math, title, style, portal}
