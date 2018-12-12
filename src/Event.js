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
 * @param {object} host
 * @param {object} event
 * @param {*} callback
 */
export function dispatch (host, event, callback) {
	Schedule.checkout(enqueue, host, event, callback)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} event
 * @param {*} callback
 */
export function enqueue (fiber, host, event, callback) {
	if (callback) {
		if (Utility.iterable(callback)) {
			Utility.each(enqueue.bind(null, fiber, host, event), callback, 0, callback)
		} else {
			resolve(host, event, callback, host.instance)
		}
	}
}

/**
 * @param {object} host
 * @param {object} event
 * @param {(function|object)} callback
 * @param {object} instance
 */
export function resolve (host, event, callback, instance) {
	Lifecycle.event(host, event, callback, instance, instance.props, instance.state, instance.context)
}
