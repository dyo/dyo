/**
 * @param {Element} element
 * @param {*} e
 * @param {string} from
 * @param {number} signature
 * @param {Element?}
 */
function errorBoundary (element, e, from, signature) {
	var error = errorException(element, e, from)
	var element = errorElement(element, error, from, signature)

	if (error.report)
		console.error(error.report)

	return element
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 */
function errorException (element, error, from) {
	if (!(error instanceof Error))
		return errorException(element, new Error(error), from)

	var report = 'Error caught in `\n\n'
	var tabs = ''
	var host = element

	while (host && host.type) {
		report += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	error.report = report + '\n` from "' + from + '"\n\n' + error.stack + '\n\n'
	
	return Object.defineProperty(error, 'error', {value: error})
}

/**
 * @param  {Element} element
 * @param  {Object} snapshot
 * @param  {Error} error
 * @param  {string} from
 * @param  {number} signature
 * @return {Element}
 */
function errorElement (element, error, from, signature) {	
	var snapshot

	if (signature === ErrorPassive || !element || !element.owner)
		return

	if (element.owner[LifecycleDidCatch])
		try {
			element.sync = WorkTask
			snapshot = element.owner[LifecycleDidCatch].call(element.instance, error, {})
			element.sync = WorkSync
		} catch (e) {
			return errorBoundary(element.host, e, LifecycleDidCatch, signature)
		}
	else
		errorElement(element.host, error, from, signature)

	if (client && from !== LifecycleRender)
		requestAnimationFrame(function () {
			reconcileElement(getHostElement(element), commitElement(snapshot))
		})

	return commitElement(snapshot)
}
