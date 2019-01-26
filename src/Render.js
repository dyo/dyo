import * as Enum from './Enum.js'
import * as Element from './Element.js'
import * as Reconcile from './Reconcile.js'
import * as Interface from './Interface.js'
import * as Schedule from './Schedule.js'
import * as Node from './Node.js'



/**
 * ***** DO MIND ME *****
 *
 * There's a strange perf cliff we hit with browser timer apis
 * when invoked inside the render pipeline.
 *
 * In src/Hook.js 83:5 we invoke setTimeout
 */

const bench = (name, fn) => {
	for (var i = 0, len = 100, out = [], now = performance.now(), val; i < len; i++) {
		if (val = fn()) {
			out[i] = i
		}
	}
	console.log(name + ':', (performance.now() - now) / len, 'ms')
}

import {state, layout, effect} from './Hook.js'
import {create} from './Element.js'

var h = create
var s = state
var f = () => {}
var c = function ({children: _0_value}, state) {
	// layout(useLayout hook) take the same code path as effect(useEffect), with the only exception being the setTimout invocation
	// layout(f)
	effect(f)

	// unrelated tests for hooks overhead(effectively none)
	// const [_0_value, _0_dispatch] = s(children + 0)
	// const [_1_value, _1_dispatch] = s(children + 1)
	// const [_2_value, _2_dispatch] = s(children + 2)
	// const [_3_value, _3_dispatch] = s(children + 3)
	// const [_4_value, _4_dispatch] = s(children + 4)
	// const [_5_value, _5_dispatch] = s(children + 5)
	return h('span', _0_value)
}
var e = h('div', {}, Array.from({length: 4000}, (v, i) => h(c, {}, i)))
var n = {size: 1}
bench('create', () => render(e, n = {size: 1}))
bench('update', () => render(e, n))
bench('timers', () => {
	setTimeout(f)
})
console.log(n)
/**
 * ***** DONT MIND ME *****
 */






/**
 * @param {any} element
 * @param {object} target
 * @param {function?} callback
 * @return {object}
 */
export function render (element, target, callback) {
	return dispatch(element, Interface.target(target, undefined), callback)
}

/**
 * @param {any} element
 * @param {object} target
 * @param {function?} callback
 * @return {object}
 */
export function dispatch (element, target, callback) {
	var parent = target[Enum.identifier]

	if (parent) {
		return Schedule.checkout(resolve, parent, target, [Element.root(element)], callback)
	} else {
		return Schedule.checkout(resolve, Element.target(element, target, Interface.clear(target)), target, target, callback)
	}
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} target
 * @param {object} value
 */
export function resolve (fiber, element, target, value) {
	if (value === target) {
		target[Enum.identifier] = Node.create(fiber, Element.top(), element, element, null)
	} else {
		Reconcile.children(fiber, element, element, 0, element.children, value)
	}
}
