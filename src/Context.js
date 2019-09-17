import * as Utility from './Utility.js'

/**
 * @param {object} props
 * @return {any}
 */
export function context (props) {
	return dispatch(this, props.value, this.state), props.children
}

/**
 * @param {object} element
 * @param {any} value
 * @param {any[object]?} context
 * @return {any}
 */
export function dispatch (element, value, context) {
	context === null ? enqueue(element, value) : context[1] = Utility.is(context[0], context[0] = value)
}

/**
 * @param {object} element
 * @param {function} value
 * @return {any[]}
 */
export function resolve (element, value) {
	if (Utility.isArray(value = value.prototype)) {
		return element.state = element.context[value[0]]
	} else {
		Utility.throws(Utility.error('Invalid Provider!'))
	}
}

/**
 * @param {object} element
 * @param {any} value
 */
export function enqueue (element, value) {
	dequeue(element, value, element.context = Utility.create(element.context), element.host.type)
}

/**
 * @param {object} element
 * @param {any} value
 * @param {object} context
 * @param {function} type
 */
export function dequeue (element, value, context, type) {
	element.state = context[(Utility.isArray(type.prototype) ? type.prototype : type.prototype = [Utility.symbol(), false])[0]] = [value]
}
