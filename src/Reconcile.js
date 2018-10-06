import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Component from './Component.js'
import * as Node from './Node.js'
import * as Commit from './Commit.js'
import * as Schedule from './Schedule.js'

/**
 * @param {object} fiber
 * @param {number} type
 * @param {object} host
 * @param {*} parent
 * @param {*} a
 * @param {*} b
 */
export function resolve (fiber, host, parent, a, b) {
	return Utility.resolve(Schedule.suspend(fiber, a.type = b.type), function (value) {
		if (a.type === b.type) {
			Schedule.resolve(fiber, Enum.children, host, parent, a.children, Element.children(value), Schedule.enqueue)
		}
	})
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {object} c
 * @param {number} idx
 */
export function element (fiber, host, parent, a, b, c, idx) {
	if (a.type !== b.type) {
		return type(fiber, host, parent, a, b, c, idx)
	}

	switch (a.constructor) {
		case Enum.text:
		case Enum.comment:
			if (a.children !== b.children) {
				Schedule.enqueue(fiber, Enum.content, host, a, a.children = b.children, a)
			}
		case Enum.empty:
			return
		case Enum.component:
			return Component.resolve(fiber, host, a, b, {})
		case Enum.thenable:
			return resolve(fiber, host, parent, a, b)
	}

	children(fiber, host, a, a.children, b.children)
	props(fiber, host, a, object(a.props, a.props = b.props))
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {object} c
 * @param {number} idx
 */
export function type (fiber, host, parent, a, b, c, idx) {
	Schedule.enqueue(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, c[idx] = b, idx + 1), a)
	Schedule.enqueue(fiber, Enum.unmount, host, parent, a, Node.destroy(fiber, a))
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 */
export function props (fiber, host, parent, a) {
	if (a) {
		Schedule.enqueue(fiber, Enum.props, host, parent, a, Enum.update)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 */
export function children (fiber, host, parent, a, b) {
	var prev = parent
	var next = parent
	var alen = a.length
	var blen = b.length
	var aend = alen - 1
	var bend = blen - 1
	var min = bend > aend ? aend : bend
	var max = bend > aend ? bend : aend
	var idx = 0
	var ptr = 0

	// step 0, noop
	if (max === -1) {
		return
	}

	// step 1, prefix/suffix
	if (min !== -1) {
		outer: {
			while ((prev = a[idx]).key === (next = b[idx]).key) {
				element(fiber, host, parent, prev, next, a, idx)
				if (++idx > min) { break outer }
			}
			while ((prev = a[aend]).key === (next = b[bend]).key) {
				element(fiber, host, parent, a[max] = prev, next, a, bend)
				if (--aend, --bend, --max, idx > --min) { break outer }
			}
		}
	}

	// step 2, mount/unmount/sort
	if (idx > aend++) {
		if (idx <= bend++) {
			if (bend < blen) do {
				Schedule.enqueue(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, a[--bend] = b[bend], bend + 1), a[bend + 1])
			} while (idx < bend) else do {
				Schedule.enqueue(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, a[--bend] = b[bend], bend + 1), null)
			} while (idx < bend)
		}
	} else if ((ptr = idx) > bend++) {
		do {
			Schedule.enqueue(fiber, Enum.unmount, host, parent, prev = a[idx++], Node.destroy(fiber, prev))
		} while (idx < aend)
		a.splice(ptr, aend - bend)
	} else {
		sort(fiber, host, parent, a, b, idx, aend, bend)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {number} idx
 * @param {number} aend
 * @param {number} bend
 */
export function sort (fiber, host, parent, a, b, idx, aend, bend) {
	var aidx = idx
	var bidx = idx
	var akey = {}
	var bkey = {}
	var move = 0
	var post = bend
	var node = parent

	// step 3, map
	while (aidx < aend | bidx < bend) {
		if (aidx < aend) { akey[a[aidx].key] = aidx++ }
		if (bidx < bend) { bkey[b[bidx].key] = bidx++ }
	}

	// step 4, sort
	while (aidx > idx | bidx > idx) {
		if (aidx > idx) {
			if ((move = bkey[(node = a[--aidx]).key]) !== undefined) {
				element(fiber, host, parent, node, b[move], a, aidx)

				if (move < aidx & aidx !== 0) {
					Schedule.enqueue(fiber, Enum.mount, host, parent, node, a[move])
					a.splice(aidx++, 1)
					a.splice(move, 0, node)
					continue
				}
			} else {
				Schedule.enqueue(fiber, Enum.unmount, host, parent, node, Node.destroy(fiber, node))
				a.splice(aidx, 1)
				if (--post) { continue }
			}
		}

		if (bidx > idx) {
			if ((move = akey[(node = b[--bidx]).key]) === undefined) {
				Schedule.enqueue(fiber, Enum.mount, host, parent, node = Node.create(fiber, host, parent, node, bidx + 1), a[post])
				a.splice(post, 0, node)
			} else {
				post = move
			}
		}
	}
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object?}
 */
export function object (a, b) {
	if (a === b) {
		return
	}

	var size = 0
	var diff = {}

	for (var key in a) {
		if (!Utility.has(b, key)) {
			diff[++size, key] = null
		}
	}

	for (var key in b) {
		var prev = a[key]
		var next = b[key]

		if (prev !== next) {
			if (typeof next !== 'object' || next === null) {
				diff[++size, key] = next
			} else if (next = object(prev || {}, next)) {
				diff[++size, key] = next
			}
		}
	}

	if (size) {
		return diff
	}
}
