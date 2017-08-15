/**
 * @param {Element} element
 * @param {string} from
 */
function Exception (element, from) {
	if (!(this instanceof Error))
		return Exception.call(new Error(this), element, from)

	var tabs = ''
	var tree = ''
	var host = element
	var stack = this.stack

	while (host.type) {
		tree += tabs + '<' + (host.type.displayName || host.type.name || 'anonymous') + '>\n'
		tabs += '  '
		host = host.host
	}

	console.error('Error caught in `\n\n'+tree+'\n`'+' from "'+from+'"'+'\n\n'+stack+'\n\n')

	this.from = from
	this.tree = tree

	return this
}

/**
 * @param {Element} element
 * @param {Error} err
 * @param {string} from
 * @param {Element}
 */
function Boundary (element, err, from) {	
	try {
		return Recovery(element, Exception.call(err, element, from), from)
	} catch (e) {}
}

/**
 * @param {Element} element
 * @param {Error} error
 * @param {string} from
 * @return {Element?}
 */
function Recovery (element, error, from) {
	if (element && element.owner)
		try {
			if (!element.owner[LifecycleDidCatch])
				return Recovery(element.host, error, from)

			var snapshot = element.owner[LifecycleDidCatch].call((element.sync = PriorityLow, element.instance), error)

			switch (element.sync = PriorityHigh, typeof snapshot) {
				case 'boolean':
				case 'undefined':
					break
				default:
					if (from === LifecycleRender)
						return commitElement(snapshot)
					else if (!server)
						patchElement(getHostElement(element), commitElement(snapshot))
			}
		} catch (e) {
			Boundary(element.host, e, LifecycleDidCatch)
		}
	else if (!server)
		setImmediate(function () {
			patchElement(getHostElement(element), elementText(''))
		})

	return elementText('')
}
