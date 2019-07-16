import * as Utility from './Utility.js'
import * as Schedule from './Schedule.js'

/**
 * @param {object} props
 * @return {any}
 */
export function context (props) {
	return dispatch(this, props.value, this.state), props.children
}

/**
 * @param {any?} value
 * @param {any[any]} context
 */
export function compare (value, context) {
	return Utility.is(context[0], context[0] = value) ? null : Schedule.memo(false)
}

/**
 * @param {object} element
 * @param {any} value
 * @param {any[object]?} context
 * @return {any}
 */
export function dispatch (element, value, context) {
	return context === null ? enqueue(element, value) : compare(value, context)
}

/**
 * @param {object} element
 * @param {function} value
 * @return {any}
 */
export function resolve (element, value) {
	return Utility.isArray(value = value.prototype) ? element.context[value[0]] : Utility.errors('Invalid Provider!')
}

/**
 * @param {object} element
 * @param {any} value
 * @return {any}
 */
export function enqueue (element, value) {
	return dequeue(element, value, element.context = Utility.create(element.context), value = element.host.type)
}

/**
 * @param {object} element
 * @param {any} value
 * @param {object} context
 * @param {function} type
 * @return {any}
 */
export function dequeue (element, value, context, type) {
	return element.state = context[(Utility.isArray(type.prototype) ? type.prototype : type.prototype = [Utility.symbol()])[0]] = [value]
}
