/**
 * @param {Element} element
 * @param {string} from
 */
function errorException (element, from) {
	if (!(this instanceof Error))
		return errorException.call(new Error(this), element, from)

	var tree = ''
	var tabs = ''
	var host = element
	var stack = this.stack

	while (host.type) {
		tree += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	this.from = from
	this.trace = 'Error caught in `\n\n'+tree+'\n` from "'+from+'"\n\n'+stack+'\n\n'

	console.error(this.trace)
	
	return this
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {number} signature
 * @param {Element?}
 */
function errorBoundary (element, error, from, signature) {
	return errorRecovery(element, errorException.call(error, element, from), from, signature)
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {number} signature
 * @return {Element}
 */
function errorRecovery (element, error, from, signature) {	
	var children = elementText('')

	if (signature > 0 && element.flag !== ElementIntermediate) {
		if (element.owner && element.owner[LifecycleDidCatch])
			try {
				element.work = WorkTask
				children = commitElement(element.owner[LifecycleDidCatch].call(element.instance, error))
				element.work = WorkSync
			} catch (e) {
				enqueue(function () {
					errorBoundary(element.host, e, LifecycleDidCatch, signature)
				})
			}
		else
			enqueue(function () {
				errorRecovery(element.host, error, from, signature)
			})

		if (from !== LifecycleRender && client)
			enqueue(function () {
				reconcileElement(getHostElement(element), children)
			})
	}

	return children
}
