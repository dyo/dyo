/**
 * @param {Element} element
 * @param {string} from
 */
function Exception (element, from) {
	if (!(this instanceof Error))
		return Exception.call(new Error(this), element, from)

	var trace = ''
	var tabs = ''
	var host = element
	var stack = this.stack

	while (host.type) {
		trace += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	console.error('Error caught in `\n\n'+trace+'\n`'+' from "'+from+'"'+'\n\n'+stack+'\n\n')

	this.from = from
	this.trace = trace

	return this
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {Element}
 */
function Boundary (element, error, from) {	
	return Recovery(element, Exception.call(error, element, from), from)
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @return {Element?}
 */
function Recovery (element, error, from) {
	if (!element || !element.owner)
		return elementText('')
	
	if (!element.owner[LifecycleDidCatch])
		return Recovery(element.host, error, from)

	try {
		element.sync = PriorityTask
		error.children = element.owner[LifecycleDidCatch].call(element.instance, error)
		element.sync = PriorityHigh

		if (from === LifecycleRender)
			return commitElement(error.children)

		if (!server && from.indexOf('on') !== 0)
			patchElement(getHostElement(element), commitElement(error.children))
	} catch (e) {
		Boundary(element.host, e, LifecycleDidCatch)
	}
}
