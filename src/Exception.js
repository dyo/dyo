import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Schedule from './Schedule.js'

/**
 * @constructor
 * @param {object} host
 * @param {any} value
 */
export var struct = Utility.extend(function exception (host, value) {
	this[Enum.identifier] = host
	this.name = 'Exception'
	this.message = value
}, {
	toString: {value: function () { return this.name + ': ' + this.message + '\n' + this.stack }},
	stack: {get: function () { return Utility.define(this, 'stack', trace(this[Enum.identifier], '')) }, configurable: true}
})

/**
 * @param {object} host
 * @param {string} value
 * @return {string}
 */
export function trace (host, value) {
	return host.uid === Enum.target ? value : trace(host.host, '\tat <' + Element.display(host) + '>\n' + value)
}

/**
 * @param {object} host
 * @param {object?} value
 * @return {any}
 */
export function create (host, value) {
	return value !== null && value !== undefined && value instanceof struct ? value : new struct(host, value)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @return {function}
 */
export function throws (fiber, host, element) {
	return function (exception) { dispatch(fiber, host, element, exception) }
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {any} exception
 * @return {boolean?}
 */
export function dispatch (fiber, host, element, exception) {
	return resolve(fiber, host, element, create(host, exception), host)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 */
export function resolve (fiber, host, element, exception, current) {
	switch (current.uid) {
		case Enum.target:
			try {
				throw exception.message
			} finally {
				Utility.report(exception + '')
			}
		case Enum.component:
			if (current !== element) {
				if (current.state !== null && enqueue(fiber, host, element, exception, current, current.state.stack) !== null) {
					return
				}
			}
	}

	if (host !== element) {
		throw exception
	}

	resolve(fiber, host, element, exception, current.host)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 * @param {function[][]?} callback
 * @return {void}
 */
export function enqueue (fiber, host, element, exception, current, callback) {
	return callback ? Schedule.enqueue(fiber, Enum.callback, current, current, exception, callback) : null
}
