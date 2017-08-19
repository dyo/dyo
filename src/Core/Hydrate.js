/**
 * @param {*} subject
 * @param {Node?} target
 */
function hydrate (subject, target) {
	if (!isValidElement(subject))
		return hydrate(commitElement(subject), target)

	if (!target)
		return hydrate(subject, DOMDocument())
	
	// if (root.has(target))
	// 	return render(subject, target)

	// var parent = elementIntermediate()

	// root.set(parent.DOM.node = target, subject)
	// hydrateMount(element, {node: target.firstChild}, parent, parent, 0)
}

/**
 * @param {Element} element
 * @param {Object} sibling
 * @param {Element} parent
 * @param {Element} host
 * @param {number} signature
 */
// function hydrateMount (element, sibling, parent, host, signature) {
// 	element.host = host
// 	element.parent = parent
// 	element.context = host.context

//  	switch (element.flag) {
//  		case ElementComponent:
//  			return
//  			// return commitComponent(element, sibling, parent, host, signature)
//  		case ElementPortal:
//  			element.DOM = {node: element.type}
//  			break
//  		case ElementPromise:
//  		case ElementFragment:
//  			element.DOM = parent.DOM
//  			break
//  		case ElementNode:
//  			element.xmlns = commitXmlns(element.type, parent.xmlns)
//  		case ElementText:
//  			element.DOM = {node: sibling}
 			
//  			if (element.flag > ElementNode)
//  				return
//  	}

// 	hydrateChildren(element, sibling, host)
// 	commitProperties(element)
// }

// /**
//  * @param {Element} element
//  * @param {Node} sibling
//  * @param {Element} hosto
//  */
// function hydrateChildren (element, sibling, host) {
// 	var children = element.children
// 	var length = children.length
// 	var next = children.next

// 	while (length-- > 0) {
// 		rehydrate(!next.DOM ? next : merge(new Element(ElementNode), next), sibling, element, host, 0)
// 		next = next.next
// 		sibling.node = sibling.node.nextSibling
// 	}
// }
