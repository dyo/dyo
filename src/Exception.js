import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Suspense from './Suspense.js'
import * as Component from './Component.js'

/**
 * @constructor
 * @param {object} host
 * @param {any} value
 */
export var struct = Utility.extend(function exception (host, value) {
	this[Enum.identifier] = host
	this.message = value
	this.bubbles = Utility.thenable(value)
}, {
	/**
	 * @type {string}
	 */
	name: {value: 'Exception'},
	/**
	 * @type {string}
	 */
	type: {value: 'EXCEPTION'},
	/**
	 * @return {string}
	 */
	stack: {configurable: true, get: function () {
		return Utility.define(this, 'stack', display(this[Enum.identifier], ''))
	}},
	/**
	 * @return {string}
	 */
	toString: {value: function () {
		return this.name + ': ' + this.message + '\n' + this.stack
	}}
})

/**
 * @param {object} host
 * @param {string} value
 * @return {string}
 */
export function display (host, value) {
	return host.identity === Enum.target ? value : display(host.host, '\tat <' + Element.display(host) + '>\n' + value)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @return {function}
 */
export function throws (fiber, host) {
	return function (exception) { dispatch(fiber, host, host, exception) }
}

/**
 * @param {object} props
 * @return {object}
 */
export function boundary (props) {
	return forward(this, props, this.state)
}

/**
 * @param {object} element
 * @param {object} props
 * @param {object} state
 * @return {object}
 */
export function forward (element, props, state) {
	return element.state = element, state === null || state === element ? props.children : state
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
 * @param {object} export
 */
export function destroy (fiber, exception) {
	fiber.element = null

	try {
		Utility.throws(exception.message)
	} finally {
		Utility.report(exception + '')
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {any} exception
 */
export function dispatch (fiber, host, element, exception) {
	fiber.element !== null ? resolve(fiber, host, element, create(host, exception), host) : Utility.throws(exception)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 */
export function resolve (fiber, host, element, exception, current) {
	switch (current.identity) {
		case Enum.target:
			return destroy(fiber, exception)
		case Enum.component:
			if (element !== current) {
				if (exception.bubbles) {
					return request(fiber, host, element, exception, current)
				} else if (current.state === current) {
					return dequeue(fiber, host, element, exception, current)
				} else if (host !== element) {
					Utility.throws(exception)
				}
			}
	}

	enqueue(fiber, host, element, exception, current)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 */
export function enqueue (fiber, host, element, exception, current) {
	resolve(fiber, host, element, exception, current.host)
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 */
export function dequeue (fiber, host, element, exception, current) {
	if (current.value === null) {
		try {
			current.state = Element.fallback(current, exception)
		} finally {
			Component.request(current)
		}
	} else {
		enqueue(fiber, host, element, exception, current)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {object} current
 */
export function request (fiber, host, element, exception, current) {
	Suspense.dispatch(fiber, current, element, exception.message)
}
