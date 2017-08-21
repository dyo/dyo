/**
 * @param {Element} element
 * @param {string} from
 */
function Exception (element, from) {
	if (!(this instanceof Error))
		return Exception.call(new Error(this), element, from)

	var stack = this.stack
	var trace = ''
	var tabs = ''
	var host = element

	while (host.type) {
		trace += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	this.trace = trace
	this.from = from

	console.error('Error caught in `\n\n'+trace+'\n`'+' from "'+from+'"'+'\n\n'+stack+'\n\n')

	return this
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {Element?}
 */
function errorBoundary (element, error, from) {
	return errorRecovery(element, Exception.call(error, element, from), from)
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @return {Element?}
 */
function errorRecovery (element, error, from) {	
	try {
		var children = elementText('')

		if (/on\w+:\w+/.test(from))
			return

		if (element && element.owner) {
			if (!element.owner[LifecycleDidCatch])
				return errorRecovery(element.host, error, from)

			element.sync = PriorityTask
			children = commitElement(element.owner[LifecycleDidCatch].call(element.instance, error))
			element.sync = PriorityHigh
		}

		if (from === LifecycleRender)
			return children

		if (!server)
			patchElement(getHostElement(element), children)
	} catch (e) {
		return errorBoundary(element.host, e, LifecycleDidCatch)
	}
}
