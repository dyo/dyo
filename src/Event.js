import * as Utility from './Utility.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'
import * as Interface from './Interface.js'

/**
 * @param {object} event
 */
export function handle (event) {
	dispatch(this.host, event, Interface.event(event, this.instance))
}

/**
 * @param {object} element
 * @param {object} event
 * @param {*} callback
 */
export function dispatch (element, event, callback) {
	Schedule.checkout(enqueue, element, event, callback)
}

/**
 * @param {object} fiber
 * @param {object} element
 * @param {object} event
 * @param {*} callback
 */
export function enqueue (fiber, element, event, callback) {
	if (callback) {
		if (Utility.iterable(callback)) {
			Utility.each(enqueue.bind(null, fiber, element, event), callback, 0)
		} else {
			resolve(element, event, callback, element.instance)
		}
	}
}

/**
 * @param {object} element
 * @param {object} event
 * @param {(function|object)} callback
 * @param {object} instance
 */
export function resolve (element, event, callback, instance) {
	Lifecycle.event(element, event, callback, instance, instance.props, instance.state, instance.context)
}
