import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Lifecycle from './Lifecycle.js'
import * as Interface from './Interface.js'

/**
 * @this {object}
 * @param {object}
 */
export function handle (event) {
	dispatch(this[Enum.host][Enum.owner], event, Interface.event(this, event))
}

/**
 * @param {object} instance
 * @param {object} event
 * @param {*} calllback
 */
function dispatch (instance, event, callback) {
	if (callback) {
		if (Utility.iterable(callback)) {
			Utility.each(function (callback) {
				dispatch(instance, event, callback)
			}, callback, 0)
		} else {
			Lifecycle.event(instance, event, instance.props, instance.state, callback)
		}
	}
}
