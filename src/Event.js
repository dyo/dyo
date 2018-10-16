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
	resolve(Element.get(this, Enum.host), Interface.event(this, event), event)
}

/**
 * @param {object} element
 * @param {*} callback
 * @param {object} event
 */
export function resolve (element, callback, event) {
	dispatch(element, callback, event, Element.get(element, Enum.owner))
}

/**
 * @param {object} element
 * @param {*} callback
 * @param {object} event
 * @param {object} instance
 */
export function dispatch (element, callback, event, instance) {
	Schedule.forward(checkout, element, callback, instance, event)
}

/**
 * @param {object} element
 * @param {*} callback
 * @param {object} event
 * @param {object} instance
 */
export function checkout (element, callback, event, instance) {
	if (callback) {
		if (Utility.iterable(callback)) {
			Utility.each(function (callback) {
				commit(element, callback, event, instance)
			}, callback, 0)
		} else {
			Lifecycle.event(element, event, callback, instance, instance.props, instance.state, instance.context)
		}
	}
}
