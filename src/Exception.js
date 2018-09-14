import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'

import Registry from './Registry.js'

/**
 * @constructor
 * @param {object} host
 * @param {object} element
 * @param {*} error
 */
export var construct = Utility.extend(function (host, element, error) {
	try {
		Registry.set(Utility.define(this, 'source', {value: host}), element)
	} finally {
		this.error = error
	}
}, {
	/**
	 * @type {function}
	 * @return {string}
	 */
	toString: {
		value: function () {
			return this.componentStack
		}
	},
	/**
	 * @type {string}
	 */
	componentStack: {
		get: function () {
			return trace(this.source, Registry.get(this), '')
		}
	}
})


/**
 * @param {object} element
 * @return {string}
 */
export function display (element) {
	return '\tat ' + Element.display(element) + '\n'
}

/**
 * @param {object} host
 * @param {string} stack
 * @return {string}
 */
export function trace (host, element, stack) {
	if (host.constructor === Enum.portal) {
		return stack + display(element)
	} else {
		return trace(host[Enum.host], element, display(host) + stack)
	}
}

/**
 * @param {object} host
 * @param {object} element
 * @param {*} exception
 * @param {number} pid
 * @return {object?}
 */
export function create (host, element, exception, pid) {
	if (exception instanceof construct) {
		return recover(host, element, exception, pid)
	} else if (host === element) {
		return create(host[Enum.host], element, exception, pid)
	} else {
		return create(host, element, new construct(host, element, exception), pid)
	}
}

/**
 * @param {object} host
 * @param {object} element
 * @param {object} exception
 * @param {number} pid
 * @return {object?}
 */
export function recover (host, element, exception, pid) {
	switch (host.constructor) {
		case Enum.portal:
			try {
				throw exception.error
			} finally {
				if (exception.message = exception.toString()) {
					console.error(exception.message)
				}
			}
		case Enum.component:
			if (host[Enum.owner][Enum.componentDidCatch]) {
				try {
					return Lifecycle.update(host[Enum.owner], exception.error, exception, Enum.componentDidCatch)
				} catch (error) {
					return create(host[Enum.host], element, error, pid)
				}
			}
		default:
			if (Utility.abs(pid) === Enum.pid) {
				return recover(host[Enum.host], element, exception, pid)
			}
	}

	throw exception
}
