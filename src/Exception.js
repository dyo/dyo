import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Lifecycle from './Lifecycle.js'

import Registry from './Registry.js'

/**
 * @constructor
 * @param {object} element
 * @param {*} error
 */
export var constructor = Utility.extend(function (element, error) {
	this.error = error, Registry.set(this, element)
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
			return trace(Registry.get(this), '')
		}
	}
})

/**
 * @param {object} element
 * @param {string} stack
 * @return {string}
 */
export function trace (element, stack) {
	if (element.id === Constant.component) {
		return stack + '\tat ' + trace(element.host, Element.display(element) + '\n')
	} else {
		return stack
	}
}

/**
 * @param {object} element
 * @param {*} error
 * @return {object?}
 */
export function create (element, error) {
	return recover(element.host, element.parent, element, error instanceof constructor ? error : new constructor(element, error))
}

/**
 * @param {object} host
 * @param {obejct} parent
 * @param {object} element
 * @param {object} exception
 * @return {object?}
 */
export function recover (host, parent, element, exception) {
	if (host.id === Constant.component) {
		if (host.owner) {
			if (host.owner[Constant.componentDidCatch]) {
				try {
					return Element.empty(element.key)
				} finally {
					Lifecycle.exception(host, Constant.componentDidCatch, exception.error, exception)
				}
			}
		}
	}

	if (host === parent) {
		if (host.host) {
			return recover(host.host, parent, element, exception)
		} else {
			try {
				throw exception.error
			} finally {
				if (exception.message = exception.toString()) {
					console.error(exception.message)
				}
			}
		}
	}

	throw exception
}
