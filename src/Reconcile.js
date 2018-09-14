import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Component from './Component.js'
import * as Node from './Node.js'
import * as Commit from './Commit.js'
import * as Schedule from './Schedule.js'

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {object} c
 * @param {number} idx
 */
export function resolve (fiber, pid, host, parent, a, b, c, idx) {
	if (a.type === b.type) {
		switch (a.constructor) {
			case Enum.component:
				return Schedule.commit(fiber, Schedule.accumulate(pid), Enum.component, host, a, b, Enum.props)
			case Enum.thenable:
				return Schedule.commit(fiber, pid, Enum.thenable, host, a, b, idx)
			case Enum.text:
			case Enum.comment:
				if (a.children !== b.children) {
					Schedule.commit(fiber, pid, Enum.content, host, a, a.children = b.children, idx)
				}
			case Enum.empty:
				return
			default:
				children(fiber, pid, host, a, a.children, b.children)
				props(fiber, pid, host, a, object(a.props, a.props = b.props))
		}
	} else {
		type(fiber, pid, host, parent, a, b, c, idx)
	}
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {object} c
 * @param {number} idx
 */
export function type (fiber, pid, host, parent, a, b, c, idx) {
	Schedule.commit(fiber, pid, Enum.mount, host, parent, c[idx] = Node.create(fiber, pid, host, parent, b, idx, Enum.create), a)
	Schedule.commit(fiber, pid, Enum.unmount, host, parent, Node.destroy(fiber, pid, host, a), null)
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 */
export function props (fiber, pid, host, parent, a) {
	if (a) {
		Schedule.commit(fiber, pid, Enum.props, host, parent, a, Enum.update)
	}
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 */
export function children (fiber, pid, host, parent, a, b) {
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
				resolve(fiber, pid, host, parent, prev, next, a, idx)
				if (++idx > min) { break outer }
			}
			while ((prev = a[aend]).key === (next = b[bend]).key) {
				resolve(fiber, pid, host, parent, a[max] = prev, next, a, bend)
				if (--aend, --bend, --max, idx > --min) { break outer }
			}
		}
	}

	// step 2, mount/unmount/sort
	if (idx > aend++) {
		if (idx <= bend++) {
			if (bend < blen) do {
				Schedule.commit(fiber, pid, Enum.mount, host, parent, a[--bend] = Node.create(fiber, pid, host, parent, b[bend], bend, Enum.create), a[bend + 1])
			} while (idx < bend) else do {
				Schedule.commit(fiber, pid, Enum.mount, host, parent, a[--bend] = Node.create(fiber, pid, host, parent, b[bend], bend, Enum.create), null)
			} while (idx < bend)
		}
	} else if ((ptr = idx) > bend++) {
		do {
			Schedule.commit(fiber, pid, Enum.unmount, host, parent, Node.destroy(fiber, pid, host, a[idx++]), null)
		} while (idx < aend)
		a.splice(ptr, aend - bend)
	} else {
		sort(fiber, pid, host, parent, a, b, idx, aend, bend)
	}
}

/**
 * @param {object} fiber
 * @param {number} pid
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {number} idx
 * @param {number} aend
 * @param {number} bend
 */
export function sort (fiber, pid, host, parent, a, b, idx, aend, bend) {
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
				resolve(fiber, pid, host, parent, node, b[move], a, aidx)

				if (move < aidx & aidx !== 0) {
					Schedule.commit(fiber, pid, Enum.mount, host, parent, node, a[move])
					a.splice(aidx++, 1)
					a.splice(move, 0, node)
					continue
				}
			} else {
				Schedule.commit(fiber, pid, Enum.unmount, host, parent, Node.destroy(fiber, pid, host, node), null)
				a.splice(aidx, 1)
				if (--post) { continue }
			}
		}

		if (bidx > idx) {
			if ((move = akey[(node = b[--bidx]).key]) === undefined) {
				Schedule.commit(fiber, pid, Enum.mount, host, parent, node = Node.create(fiber, pid, host, parent, node, bidx, Enum.create), a[post])
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
