/**
 * @param {Element} element
 * @param {string} from
 */
function errorException (element, from) {
	if (!(this instanceof Error))
		return errorException.call(new Error(this), element, from)

	var children = ''
	var tabs = ''
	var host = element
	var stack = this.stack

	while (host.type) {
		children += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	this.children = children
	this.from = from

	console.error('Error caught in `\n\n'+children+'\n` from "'+from+'"\n\n'+stack+'\n\n')
	
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

	try {
		if (signature > 0) {
				if (element.owner && element.owner[LifecycleDidCatch]) {
					element.work = WorkTask
					children = commitElement(element.owner[LifecycleDidCatch].call(element.instance, error))
					element.work = WorkSync
				} else if (element.host.owner)
					enqueue(function () {
						errorRecovery(element.host, error, from, signature)
					})

			if (from !== LifecycleRender && client)
				enqueue(function () {
					reconcileElement(getHostElement(element), children)
				})
		}
	} catch (e) {
		enqueue(function () {
			errorBoundary(element.host, e, LifecycleDidCatch, signature)
		})
	}

	return children
}
