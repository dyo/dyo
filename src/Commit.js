import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'
import * as Exception from './Exception.js'
import * as Interface from './Interface.js'

/*
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {Promise<*>} type
 */
export function thenable (host, parent, element, type) {
	element.type.then(function (value) {
		if (element.active > Constant.idle) {
			if (element.type === type) {
				// Reconcile.children(host, element, element.children, [Element.module(value, 0)])
			}
		}
	}, function (err) {
		Error.raise(element, err, Constant.render)
	})
}









/**
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {number} from
 */
export function create (host, parent, snapshot, from) {
	try {
		var xmlns = Interface.namespace(snapshot, parent.xmlns)
		var element = new Element.constructor(host, parent, snapshot, Interface.create(snapshot, xmlns, from))
		var current = element

		if (!element.owner) {
			if (current = parent, element.uuid === Constant.component) {
				return Component.finalize(element, Element.put(element, create(element, parent, Component.mount(host, element)), from))
			}
		}
		if (element.uuid < Constant.text) {
			for (var i = 0, j = element.children; i < j.length; ++i) {
				append(current, j[i] = create(host, current, j[i], from), Constant.create)
			}
			if (element.props !== Constant.object) {
				props(element, element.props, xmlns, Constant.create)
			}
		}

		return element
	} catch (err) {
		throw err
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @return {object}
 */
export function destroy (parent, element) {
	try {
		switch (element.active = Constant.idle, element.uuid) {
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
			console.log(element, element.ref)
			refs(element)
		}
	}
}

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {number} index
 */
export function replace (host, parent, element, snapshot, index) {
	mount(parent, parent.children[index] = create(host, parent, snapshot, Constant.create), element)
	unmount(parent, destroy(parent, element))
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
			})
		}
	}

	remove(parent, element)
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 */
export function mount (parent, element, sibling) {
	if (sibling) {
		insert(parent, element, sibling, Constant.update)
	} else {
		append(parent, element, Constant.update)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 */
export function remove (parent, element) {
	if (element.uuid < Constant.node) {
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
 * @param {number} from
 */
export function append (parent, element, from) {
	if (element.uuid < Constant.node) {
		if (element.uuid !== Constant.portal) {
			element.children.forEach(function (element) {
				append(parent, element, from)
			})
		}
	} else {
		Interface.append(Element.parent(parent, from), element)
	}
}

/**
 * @param {object} parent
 * @param {object} element
 * @param {object} sibling
 * @param {number} from
 */
export function insert (parent, element, sibling, from) {
	if (element.uuid < Constant.node) {
		if (element.uuid !== Constant.portal) {
			element.children.forEach(function (element) {
				insert(parent, element, sibling, from)
			})
		}
	} else {
		Interface.insert(Element.parent(parent, from), element, Element.node(sibling))
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
 * @param {string?} xmlns
 * @param {number} from
 */
export function props (element, props, xmlns, from) {
	for (var key in Interface.props(element, props, from)) {
		switch (key) {
			case 'ref':
				refs(element, props[key], from)
			case 'key':
			case 'xmlns':
			case 'children':
				break
			default:
				Interface.commit(element, key, props[key], xmlns, from)
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
