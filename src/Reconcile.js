import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Commit from './Commit.js'
import * as Component from './Component.js'

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {number} index
 */
export function update (host, parent, element, snapshot, index) {
	if (element.type !== snapshot.type) {
		if (element.uuid !== Constant.thenable || snapshot.uuid !== Constant.thenable) {
			return Commit.replace(host, parent, element, snapshot, index)
		}
	}

	switch (element.uuid) {
		case Constant.text:
		case Constant.empty:
		case Constant.comment:
			return content(element, element.children, snapshot.children)
		case Constant.component:
			return Component.update(host, parent, element, snapshot, Constant.object, Constant.update)
		case Constant.thenable:
			return Commit.thenable(host, parent, element, index, element.type = snapshot.type)
		default:
			children(host, element, element.children, snapshot.children)
			props(element, element.props, snapshot.props)
	}
}

/**
 * @param {object} element
 * @param {(string|number)} a
 * @param {(string|number)} b
 */
export function content (element, a, b) {
	if (a != b) {
		Commit.content(element, element.children = b)
	}
}

/**
 * @param {object} element
 * @param {object} a
 * @param {object} b
 */
export function props (element, a, b) {
	if (a !== b) {
		Commit.props(element, object(a, element.props = b), element.xmlns, Constant.update)
	}
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object?}
 */
export function object (a, b) {
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

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {number} b
 */
export function children (host, parent, a, b) {
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

	// step 1, prefix/suffix
	outer: {
		while ((prev = a[idx]).key === (next = b[idx]).key) {
			update(host, parent, prev, next, idx)
			if (++idx > min) { break outer }
		}
		while ((prev = a[aend]).key === (next = b[bend]).key) {
			update(host, parent, a[max] = prev, next, bend)
			if (--aend, --bend, --max, idx > --min) { break outer }
		}
	}

	// step 2, mount/unmount/sort
	if (idx > aend++) {
		if (idx <= bend++) {
			if (bend < blen) do {
				Commit.mount(parent, a[--bend] = Commit.create(host, parent, b[bend], Constant.create), a[bend + 1])
			} while (idx < bend) else do {
				Commit.mount(parent, a[--bend] = Commit.create(host, parent, b[bend], Constant.create), null)
			} while (idx < bend)
		}
	} else if ((ptr = idx) > bend++) {
		do { Commit.unmount(parent, Commit.destroy(parent, a[idx++])) } while (idx < aend)
		a.splice(ptr, aend - bend)
	} else {
		sort(host, parent, a, b, idx, aend, bend)
	}
}

/**
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {number} idx
 * @param {number} aend
 * @param {number} bend
 */
export function sort (host, parent, a, b, idx, aend, bend) {
	var aidx = idx
	var bidx = idx
	var akey = []
	var bkey = []
	var move = 0
	var pos = bend
	var child = parent

	// step 3, map
	while (aidx < aend | bidx < bend) {
		if (aidx < aend) { akey[a[aidx].key] = aidx++ }
		if (bidx < bend) { bkey[b[bidx].key] = bidx++ }
	}

	// step 4, sort
	while (aidx > idx | bidx > idx) {
		if (aidx > idx) {
			if ((move = bkey[(child = a[--aidx]).key]) !== undefined) {
				update(host, parent, child, b[move], move)

				if (move < aidx & aidx !== 0) {
					Commit.mount(parent, child, a[move])
					a.splice(aidx++, 1)
					a.splice(move, 0, child)
					continue
				}
			} else {
				Commit.unmount(parent, Commit.destroy(parent, child))
				a.splice(aidx, 1)
				if (--pos) { continue }
			}
		}

		if (bidx > idx) {
			if ((move = akey[(child = b[--bidx]).key]) === undefined) {
				Commit.mount(parent, child = Commit.create(host, parent, child, Constant.create), a[pos])
				a.splice(pos, 0, child)
			} else {
				pos = move
			}
		}
	}
}
