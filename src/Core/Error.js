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

	while (host.type) {
		children += tabs + '<' + getDisplayName(host.type) + '>\n'
		tabs += '  '
		host = host.host
	}

	console.error('Error caught in `\n\n'+(this.children = children)+'\n`'+' from "'+from+'"'+'\n\n'+this.stack+'\n\n')

	return this.from = from, this
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @param {Element?}
 */
function errorBoundary (element, error, from) {
	return errorRecovery(element, errorException.call(error, element, from), from)
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @return {Element}
 */
function errorRecovery (element, error, from) {	
	var children = elementText('')

	try {
		if (!/on\w+:\w+/.test(from)) {
				if (element.owner && element.owner[LifecycleDidCatch]) {
					element.work = WorkTask
					children = commitElement(element.owner[LifecycleDidCatch].call(element.instance, error))
					element.work = WorkSync
				} else if (element.host.owner)
					setImmediate(function () {
						errorBoundary(element.host, error, from)
					})

			if (from !== LifecycleRender && !server)
				setImmediate(function () {
					reconcileElement(getHostElement(element), children)
				})
		}
	} catch (e) {
		setImmediate(function () {
			errorBoundary(element.host, e, LifecycleDidCatch)
		})
	}

	return children
}
