import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Exception from './Exception.js'
import * as Schedule from './Schedule.js'
import * as Node from './Node.js'

/**
 * @param {object} fiber
 * @param {object} host
 * @param {any} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {object} type
 * @param {object[]} a
 * @param {object[]} b
 * @return {object}
 */
export function resolve (fiber, host, parent, element, snapshot, type, a, b) {
	if (!(element.state = element === snapshot)) {
		Utility.timeout(function () {
			if (!element.state) {
				enqueue(fiber, host, parent, element, snapshot, b, a, [])
			}
		}, Enum.timeout)
	}

	return Schedule.promise(fiber, type, function (value) {
		if (element.state = element.type === value) {
			if (Utility.asyncIterable(value)) {
				if (!value.done) {
					return enqueue(fiber, host, parent, element, snapshot, value.value, a, a), resolve(fiber, host, parent, element, snapshot, value, a, b)
				}
			} else {
				enqueue(fiber, host, parent, element, snapshot, value, a, a)
			}
		}
	}, Exception.throws(fiber, host, parent))
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {(object|object[])} value
 * @param {object[]} a
 * @param {object[]} b
 */
export function enqueue (fiber, host, parent, element, snapshot, value, a, b) {
	if (a.parent !== null) {
		children(fiber, host, parent, 0, a, a === b ? Element.resolve(type, snapshot.props) : value)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {object[]} siblings
 * @param {number} index
 */
export function replace (fiber, host, parent, element, snapshot, siblings, index) {
	Schedule.dispatch(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, siblings[index] = snapshot, null), element)
	Schedule.dispatch(fiber, Enum.unmount, host, parent, element, Node.destroy(fiber, element))
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {object} snapshot
 * @param {object[]} siblings
 * @param {number} index
 */
export function update (fiber, host, parent, element, snapshot, siblings, index) {
	// ***** DO MIND ME *****
	// TODO uncomment once the setTimeout perf cliff is figured out
	// if (element === snapshot) {
	// 	return
	// }

	var uid = snapshot.uid
	var type = snapshot.type
	var a = element.children
	var b = snapshot.children

	if (element.type === type) {
		switch (uid) {
			case Enum.text:
				if (a !== b) {
					Schedule.dispatch(fiber, Enum.content, host, parent, element, element.children = b)
				}
			case Enum.empty:
				return
			case Enum.component:
				return Schedule.dispatch(fiber, Enum.component, host, element, snapshot.props, a)
			case Enum.fragment:
				return children(fiber, host, element, 0, a, b)
			case Enum.thenable:
				return resolve(fiber, host, parent, element, snapshot, element.type = type, a, b)
		}

		children(fiber, host, element, 0, a, b)
		props(fiber, host, parent, element, object(element.props, element.props = snapshot.props))
	} else {
		if (element.id === uid) {
			switch (element.type = type, uid) {
				case Enum.target:
					Schedule.dispatch(fiber, Enum.props, host, element, element, object(element.props, element.props = {}))
					Schedule.dispatch(fiber, Enum.target, host, element, element, element)
				case Enum.thenable:
					return update(fiber, host, parent, element, snapshot, siblings, index)
			}
		}

		replace(fiber, host, parent, element, snapshot, siblings, index)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {number} offset
 * @param {object[]} a
 * @param {object[]} b
 */
export function children (fiber, host, parent, offset, a, b) {
	var apos = 0
	var bpos = 0
	var aidx = 0
	var bidx = 0
	var alen = a.length - offset
	var blen = b.length

	if (alen + alen === 0) {
		return
	}

	var aend = alen - 1
	var bend = blen - 1
	var ahead = a[aidx]
	var bhead = b[bidx]
	var atail = a[aend]
	var btail = b[bend]
	var amove = null
	var akeys = null
	var bkeys = null
	var delta = 0

	while (true) {
		// step 1, prefix/suffix/affix(rl)/affix(lr)
		outer: if (alen * blen !== 0) {
			while (ahead.key === bhead.key) {
				update(fiber, host, parent, ahead, bhead, a, aidx)
				if (++aidx > aend | ++bidx > bend) { break outer }
				ahead = a[aidx], bhead = b[bidx]
			}
			while (atail.key === btail.key) {
				update(fiber, host, parent, atail, btail, a, aend)
				if (aidx > --aend | bidx > --bend) { break outer }
				atail = a[aend], btail = b[bend]
			}
			if (atail.key === bhead.key) {
				update(fiber, host, parent, atail, bhead, a, aidx)
				Schedule.dispatch(fiber, Enum.mount, host, parent, atail, a[aidx])
				a.splice(aidx, 0, (a.splice(aend, 1), ++delta, atail))
				ahead = a[++aidx], bhead = b[++bidx], atail = a[aend]
				continue
			}
			if (ahead.key === btail.key) {
				update(fiber, host, parent, ahead, btail, a, aend)
				Schedule.dispatch(fiber, Enum.mount, host, parent, ahead, a[aend + 1])
				a.splice(aend, 0, (a.splice(aidx, 1), --delta, ahead))
				atail = a[--aend], btail = b[--bend], ahead = a[aidx]
				continue
			}
		}

		// step 2, noop/mount/unmount/replace
		if (aidx > aend) {
			if (bidx <= bend) {
				atail = a[aend + 1]
				while (bidx <= bend) {
					Schedule.dispatch(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, btail = b[bidx], null), atail)
					a.splice(bidx++, 0, btail)
				}
			}
		} else if (bidx > bend) {
			while (aidx <= aend) {
				Schedule.dispatch(fiber, Enum.unmount, host, parent, ahead = a[aend], Node.destroy(fiber, ahead))
				a.splice(aend--, 1)
			}
		} else if (((apos = aend + 1) - aidx) * ((bpos = bend + 1) - bidx) === 1) {
			replace(fiber, host, parent, ahead, bhead, a, aidx)
		} else {
			// step 3, keymap/unmount(rl)/unmount(lr)/mount/move
			if (akeys === bkeys) {
				akeys = {}, bkeys = {}, delta = 0
				while (apos > aidx | bpos > bidx) {
					if (apos > aidx) { akeys[a[--apos].key] = apos }
					if (bpos > bidx) { bkeys[b[--bpos].key] = bpos }
				}
			}

			if (bkeys[atail.key] === undefined) {
				Schedule.dispatch(fiber, Enum.unmount, host, parent, atail, Node.destroy(fiber, atail))
				a.splice((atail = aend > 0 ? a[aend - 1] : a[aend + 1], aend--), 1)
			} else if (bkeys[ahead.key] === undefined) {
				Schedule.dispatch(fiber, Enum.unmount, host, parent, ahead, Node.destroy(fiber, ahead))
				a.splice((ahead = a[aidx + 1], --delta, --aend, aidx), 1)
			} else if (akeys[bhead.key] === undefined) {
				Schedule.dispatch(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, bhead, null), ahead)
				a.splice((++delta, ++aend, aidx), 0, bhead)
				ahead = a[++aidx], bhead = b[++bidx]
			} else {
				update(fiber, host, parent, amove = a[apos = (akeys[ahead.key] = akeys[bhead.key]) + delta], bhead, a, aidx)
				Schedule.dispatch(fiber, Enum.mount, host, parent, a[aidx] = amove, ahead)
				Schedule.dispatch(fiber, Enum.mount, host, parent, a[apos] = ahead, a[apos + 1])
				ahead = a[++aidx], bhead = b[++bidx]
			}
			continue
		}
		break
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 */
export function props (fiber, host, parent, a, b) {
	if (b) {
		Schedule.dispatch(fiber, Enum.props, host, parent, a, b)
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
			if (key !== 'style' || prev === null || next === null || typeof next !== 'object') {
				diff[++size, key] = next
			} else if (next = object(prev, next)) {
				diff[++size, key] = next
			}
		}
	}

	if (size > 0) {
		return diff
	}
}
