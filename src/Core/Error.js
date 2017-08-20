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

	while (host.type) {
		trace += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	this.from = from
	this.trace = trace

	console.error('Error caught in `\n\n'+trace+'\n`'+' from "'+from+'"'+'\n\n'+this.stack+'\n\n')

	return this
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {Element?}
 */
function Boundary (element, error, from) {
	return Recovery(element, Exception.call(error, element, from), from, {})
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @return {Element?}
 */
function Recovery (element, error, from) {
	var children = elementText('')

	if (/on\w+:\w+/.test(from))
		return

	if (!element || !element.owner)
		return children
	
	if (!element.owner[LifecycleDidCatch])
		return Recovery(element.host, error, from)

	try {
		element.sync = PriorityTask
		children = commitElement(element.owner[LifecycleDidCatch].call(element.instance, error))
		element.sync = PriorityHigh

		if (from === LifecycleRender)
			return children

		if (!server)
			patchElement(getHostElement(element), children)
	} catch (e) {
		return Boundary(element.host, e, LifecycleDidCatch)
	}
}
