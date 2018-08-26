import * as Constant from './Constant.js'
import * as Utility from './Utility.js'
import * as Schedule from './Schedule.js'
import * as Commit from './Commit.js'

/**
 * @param {number} pid
 * @param {object} element
 * @param {object} snapshot
 * @param {number} index
 */
export function update (pid, element, snapshot, index) {
	if (element.type === snapshot.type) {
		switch (element.id) {
			case Constant.text:
			case Constant.comment:
				if (element.children !== snapshot.children) {
					Schedule.commit(pid, Constant.content, element, element.children, element.children = snapshot.children)
				}
			case Constant.empty:
				return
			case Constant.component:
				return Schedule.commit(pid, Constant.component, element, snapshot, Constant.update)
			case Constant.thenable:
				return Schedule.commit(pid, Constant.thenable, element, snapshot, Constant.update)
			default:
				if (element.children !== snapshot.children) {
					children(pid, element, element.children, snapshot.children)
				}
				if (element.props !== snapshot.props) {
					Schedule.commit(pid, Constant.props, element, props(element.props, element.props = snapshot.props), Constant.update)
				}
		}
	} else {
		type(pid, element.parent, element, snapshot, index)
	}
}

/**
 * @param {number} pid
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {number} idx
 */
export function type (pid, parent, a, b, idx) {
	Schedule.commit(pid, Constant.mount, parent, parent.children[idx] = Commit.create(parent.host, parent, b, Constant.create), a)
	Schedule.commit(pid, Constant.unmount, parent, Commit.destroy(parent, a), idx)
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object?}
 */
export function props (a, b) {
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
			} else if (next = props(prev || {}, next)) {
				diff[++size, key] = next
			}
		}
	}

	if (size) {
		return diff
	}
}

/**
 * @param {number} pid
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 */
export function children (pid, parent, a, b) {
	var host = parent.host
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

	if (max < 0) {
		return
	}

	// step 1, prefix/suffix
	outer: {
		while ((prev = a[idx]).key === (next = b[idx]).key) {
			Schedule.commit(pid, Constant.update, prev, next, idx)
			if (++idx > min) { break outer }
		}
		while ((prev = a[aend]).key === (next = b[bend]).key) {
			Schedule.commit(pid, Constant.update, a[max] = prev, next, bend)
			if (--aend, --bend, --max, idx > --min) { break outer }
		}
	}

	// step 2, mount/unmount/sort
	if (idx > aend++) {
		if (idx <= bend++) {
			if (bend < blen) do {
				Schedule.commit(pid, Constant.mount, parent, a[--bend] = Commit.create(host, parent, b[bend], Constant.create), a[bend + 1])
			} while (idx < bend) else do {
				Schedule.commit(pid, Constant.mount, parent, a[--bend] = Commit.create(host, parent, b[bend], Constant.create), null)
			} while (idx < bend)
		}
	} else if ((ptr = idx) > bend++) {
		do { Schedule.commit(pid, Constant.unmount, parent, Commit.destroy(parent, a[idx]), idx++) } while (idx < aend)
		a.splice(ptr, aend - bend)
	} else {
		sort(parent, a, b, idx, aend, bend)
	}
}

/**
 * @param {number} pid
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {number} idx
 * @param {number} aend
 * @param {number} bend
 */
export function sort (pid, parent, a, b, idx, aend, bend) {
	var host = parent.host
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
				Schedule.commit(pid, Constant.update, node, b[move], aidx)

				if (move < aidx & aidx !== 0) {
					Schedule.commit(pid, Constant.mount, parent, node, a[move])
					a.splice(aidx++, 1)
					a.splice(move, 0, node)
					continue
				}
			} else {
				Schedule.commit(pid, Constant.unmount, parent, Commit.destroy(parent, node), aidx)
				a.splice(aidx, 1)
				if (--post) { continue }
			}
		}

		if (bidx > idx) {
			if ((move = akey[(node = b[--bidx]).key]) === undefined) {
				Schedule.commit(pid, Constant.mount, parent, node = Commit.create(host, parent, node, Constant.create), a[post])
				a.splice(post, 0, node)
			} else {
				post = move
			}
		}
	}
}
