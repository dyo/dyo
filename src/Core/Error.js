/**
 * @param {Element} element
 * @param {*} e
 * @param {string} from
 * @param {number} signature
 * @param {Element?}
 */
function invokeErrorBoundary (element, e, from, signature) {
	var error = getErrorException(element, e, from)
	var snapshot = getErrorElement(element, error, from, signature)

	if (error.report)
		console.error(error.report)

	return commitElement(snapshot)
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {number} signature
 * @return {Element?}
 */
function getErrorElement (element, error, from, signature) {	
	if (signature === SharedErrorPassive || !isValidElement(element))
		return

	var owner = element.owner
	var host = element.host
	var snapshot

	if (!owner || !owner[SharedComponentDidCatch])
		return host ? void getErrorElement(host, error, from, signature) : snapshot

	element.sync = SharedWorkTask

	try {
		snapshot = owner[SharedComponentDidCatch].call(element.instance, error, {})
	} catch (e) {
		invokeErrorBoundary(host, e, SharedComponentDidCatch, signature)
	}

	element.sync = SharedWorkSync

	if (from !== SharedSiteRender)
		requestAnimationFrame(function () {
			if (element.active)
				reconcileElement(getElementDescription(element), commitElement(snapshot))
		})

	return snapshot
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 */
function getErrorException (element, error, from) {
	if (!(error instanceof Error))
		return getErrorException(element, new Error(error), from)

	var report = 'Error caught in `\n\n'
	var tabs = ''
	var host = element

	while (host && host.type) {
		report += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	return defineProperties(error, {
		report: {value: report + '\n` from "' + from + '"\n\n' + error.stack + '\n\n', writable: true},
		error: {value: error}
	})
}
