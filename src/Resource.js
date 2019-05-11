import * as Utility from './Utility.js'



/**
 * @param {any[any, function]} context
 * @param {function} value
 * @param {function?} callback
 * @return {function}
 */
export function create (context, value, callback) {
	return context.length < 3 ? enqueue(context, value, [context[1], value, callback]) : context
}

/**
 * @param {any[any, function]} context
 * @param {function} value
 * @param {function?} callback
 * @return {any[any, function]}
 */
export function forward (context, value, callback) {
	return resolve(context, create(context, value, callback))
}

/**
 * @param {any[any, function]} context
 * @param {function} value
 * @return {any[any, function]}
 */
export function dispatch (context, value) {
	throw value.then(request).then(function (value) { context[0] = value })
}

/**
 * @param {any[any, function]} context
 * @param {function} value
 * @return {any[any, function]}
 */
export function resolve (context, value) {
	return Utility.thenable(value = context[0]) ? dispatch(context, value) : context
}

/**
 * @param {any[any, function]} context
 * @param {any?} value
 * @param {function[]} callback
 * @return {function}
 */
export function enqueue (context, value, callback) {
	return context[1] = context[2] = function (value) { dequeue(context, value, callback)}
}

/**
 * @param {any[any, function]} context
 * @param {any} value
 * @param {function[]} callback
 */
export function dequeue (context, value, callback) {
	if (Utility.callable(callback[2])) {
		callback[0](callback[2](value).then(function () { return callback[1](value).then(request) }))
	} else {
		callback[0](callback[1](value).then(request))
	}
}

/**
 * @param {any?} value
 * @return {any?}
 */
export function request (value) {
	return Utility.fetchable(value) ? value.json() : value
}
