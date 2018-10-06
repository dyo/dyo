import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'
import * as Schedule from './Schedule.js'
import * as Interface from './Interface.js'

/**
 * @param {object} event
 */
export function handle (event) {
	resolve(event, Element.get(this, Enum.host), Interface.event(this, event))
}

/**
 * @param {object} event
 * @param {object} element
 * @param {*} callback
 */
export function resolve (event, element, callback) {
	dispatch(event, element, callback, Element.get(element, Enum.owner))
}

/**
 * @param {object} event
 * @param {object} element
 * @param {*} callback
 * @param {object} instance
 */
export function dispatch (event, element, callback, instance) {
	Schedule.event(commit, event, element, callback, instance)
}

/**
 * @param {object} event
 * @param {object} element
 * @param {*} callback
 * @param {object} instance
 */
export function commit (event, element, callback, instance) {
	if (callback) {
		if (Utility.iterable(callback)) {
			Utility.each(function (callback) {
				commit(event, element, callback, instance)
			}, callback, 0)
		} else {
			Lifecycle.event(element, event, callback, instance.props, instance.state, instance.context)
		}
	}
}
