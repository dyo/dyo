/**
 * @param {Element} element
 * @param {string} from
 */
function Exception (element, from) {
	if (!(this instanceof Error))
		return Exception.call(new Error(this), element, from)

	var tabs = ''
	var info = ''
	var host = element
	var stack = this.stack

	while (host.type) {
		info += tabs + '<' + (host.type.displayName || host.type.name || 'anonymous') + '>\n'
		tabs += '  '
		host = host.host
	}

	console.error('Error caught in `\n\n'+info+'\n`'+' from "'+from+'"'+'\n\n'+stack+'\n\n')

	this.from = from
	this.info = info

	return this
}

/**
 * @param {Element} element
 * @param {Error} err
 * @param {string} from
 * @param {Element}
 */
function Boundary (element, err, from) {	
	return Recovery(element, Exception.call(err, element, from), from)
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
		element.sync = PriorityLow
		error.children = element.owner[LifecycleDidCatch].call(element.instance, error)
		element.sync = PriorityHigh

		switch (typeof error.children) {
			case 'boolean':
			case 'undefined':
				break
			default:
				if (from === LifecycleRender)
					return commitElement(error.children)

				if (!server)
					patchElement(getHostElement(element), commitElement(error.children))
		}
	} catch (e) {
		Boundary(element.host, e, LifecycleDidCatch)
	}
}
