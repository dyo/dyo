import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'
import * as Interface from './Interface.js'

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} snapshot
 * @param {number} from
 */
export function create (host, parent, snapshot, from) {
	var element = new Element.construct(host, parent, snapshot)
	var current = parent

	try {
		if (element.owner = Interface.create(element, element.xmlns = Interface.xmlns(element, parent.xmlns), from)) {
			current = element
		} else if (element.id === Constant.component) {
			return Component.finalize(element, Element.put(element, create(element, parent, Component.mount(element), from)), from)
		}

		if (element.id < Constant.text) {
			for (var i = 0, j = element.children; i < j.length; ++i) {
				append(current, j[i] = create(host, current, j[i], from))
			}
			if (element.id > Constant.thenable) {
				props(element, element.props, Constant.create)
			} else {
				thenable(element, element, Constant.create)
			}
		}

		element.active = Constant.active
	} catch (error) {
		return create(host, parent, Exception.create(element, error), from)
	}

	return element
}

/**
 * @param {object} parent
 * @param {object} element
 * @return {object}
 */
export function destroy (parent, element) {
	try {
		switch (element.active = Constant.idle, element.id) {
			case Constant.component:
				Component.unmount(element)
			default:
				for (var i = 0, j = element.children; i < j.length; ++i) {
					destroy(element, j[i])
				}
			case Constant.text:
			case Constant.empty:
			case Constant.comment:
				return element
		}
	} finally {
		if (element.ref) {
			refs(element)
		}
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function mount (parent, element, sibling) {
	if (sibling) {
		insert(parent, element, sibling)
	} else {
		append(parent, element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function unmount (parent, element) {
	if (element.state) {
		if (Utility.thenable(element.state)) {
			return element.state.then(function () {
				remove(parent, element)
			}, function (error) {
				Exception.create(element, error)
			})
		}
	}

	remove(parent, element)
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function remove (parent, element) {
	if (element.id < Constant.node) {
		element.children.forEach(function (element) {
			remove(parent, element)
		})
	} else {
		Interface.remove(Element.parent(parent), element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function append (parent, element) {
	if (element.id < Constant.node) {
		if (element.id < Constant.portal) {
			element.children.forEach(function (element) {
				append(parent, element)
			})
		} else {
			append(parent, Element.resolve(element))
		}
	} else {
		Interface.append(Element.parent(parent), element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function insert (parent, element, sibling) {
	if (element.id < Constant.node) {
		if (element.id < Constant.portal) {
			element.children.forEach(function (element) {
				insert(parent, element, sibling)
			})
		} else {
			insert(parent, Element.resolve(element), sibling)
		}
	} else {
		Interface.insert(Element.parent(parent), element, Element.resolve(sibling))
	}
}

/**
 * @param {object} element
 * @param {(string|number)} value
 */
export function content (element, value) {
	Interface.content(element, value)
}

/**
 * @param {object} element
 * @param {object} props
 * @param {number} from
 */
export function props (element, props, from) {
	if (props) {
		for (var key in Interface.props(element, props, from)) {
			switch (key) {
				case 'ref':
					refs(element, element.ref = props[key], from)
				case 'key':
				case 'xmlns':
				case 'children':
					break
				default:
					Interface.commit(element, key, props[key], element.xmlns, from)
			}
		}
	}
}

/**
 * @param {object} element
 * @param {*?} value
 * @param {number?} from
 */
export function refs (element, value, from) {
	switch (from) {
		default:
			Lifecycle.refs(element, element.ref, null)
		case Constant.create:
			if (value) {
				Lifecycle.refs(element, element.ref = value, element.owner)
			}
	}
}



/**
 * ------------------- The fault: line Everyhing below this line is in flux
 */



/**
 * TODO
 * @param {object} element
 * @param {object} snapshot
 * @param {number} from
 */
export function thenable (element, snapshot, from) {
	// try {
	// 	Utility.resolve(snapshot.type, function (value) {
	// 		if (element.active > Constant.idle) {
	// 			if (element.type === snapshot.type) {
	// 				// Schedule.update(-Schedule.identity(), Constant.thenable, element, Element.module(value), 0)
	// 			}
	// 		}
	// 	}, function (error) {
	// 		Exception.create(element, error)
	// 	})
	// } finally {
	// 	element.type = snapshot.type
	// }
}
