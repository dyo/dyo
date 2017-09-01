/**
 * @param {Element} element
 * @param {string} from
 */
function errorException (element, from) {
	if (!(this instanceof Error))
		return errorException.call(new Error(this), element, from)

	var trace = 'Error caught in `\n\n'
	var tabs = ''
	var host = element
	var stack = this.stack


	while (host && host.type) {
		trace += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	console.error(trace + '\n` from "' + from + '"\n\n' + stack + '\n\n')
	
	return this
}

/**
 * @param {Element} element
 * @param {*} error
 * @param {string} from
 * @param {number} signature
 * @param {Element?}
 */
function errorBoundary (element, error, from, signature) {
	return errorElement(element, errorException.call(error, element, from), from, signature)
}

/**
 * @param  {Element} element
 * @param  {Object} snapshot
 * @param  {Error} error
 * @param  {string} from
 * @param  {number} signature
 * @return {*}
 */
function errorElement (element, error, from, signature) {	
	var snapshot

	if (signature === ErrorPassive || !element || !element.owner)
		return

	if (element.owner[LifecycleDidCatch])
		try {
			element.sync = WorkTask
			snapshot = element.owner[LifecycleDidCatch].call(element.instance, error)
			element.sync = WorkSync
		} catch (e) {
			return errorBoundary(element.host, e, LifecycleDidCatch, signature)
		}
	else
		errorElement(element.host, error, from, signature)

	if (from === LifecycleRender)
		return commitElement(snapshot)
	else if (client)
		requestAnimationFrame(function () {
			reconcileElement(getHostElement(element), commitElement(snapshot))
		})
}
