import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Schedule from './Schedule.js'

/**
 * @constructor
 * @param {any} error
 * @param {object} host
 */
export var struct = Utility.extend(function exception (error, host) {
	this.error = error
	this.host = host
}, {
	toString: {value: function () { return this.componentStack }},
	componentStack: {get: function () { return Utility.define(this, 'componentStack', trace(this.host, '')) }, configurable: true}
})

/**
 * @param {object} host
 * @param {string} value
 * @return {string}
 */
export function trace (host, value) {
	return host.uid === Enum.target ? value : trace(host.host, '\tat ' + Element.display(host) + '\n' + value)
}

/**
 * @param {object} host
 * @param {object?} value
 * @return {any}
 */
export function create (host, value) {
	return value instanceof struct ? value : new struct(value, host)
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
				throw exception.error
			} finally {
				Utility.report(exception + '')
			}
		case Enum.component:
			if (current !== element) {
				if (current.state !== null) {
					if (enqueue(fiber, host, element, exception, current, current.state.stack) !== null) {
						return
					}
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
