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
	if (element !== snapshot) {
		Utility.timeout(function () {
			element.value = element.value ? null : enqueue(fiber, host, parent, element, snapshot, b, a, [])
		}, Enum.network)
	}

	return Schedule.suspend(fiber, type, function (value) {
		if (element.value = element.type === type) {
			if (Utility.asyncIterable(type)) {
				if (!value.done) {
					return enqueue(fiber, host, parent, element, snapshot, value.value, a, a), resolve(fiber, host, parent, element, snapshot, type, a, b)
				}
			} else {
				enqueue(fiber, host, parent, element, snapshot, value, a, a)
			}
		}
	}, Exception.throws(fiber, host))
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
	if (Element.active(element)) {
		children(fiber, host, parent, 0, a, a === b ? [Element.resolve(value, snapshot.props), Element.empty()] : value)
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
	Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, siblings[index] = snapshot, null), element)
	Schedule.commit(fiber, Enum.unmount, host, parent, element, Node.destroy(fiber, parent, element, null))
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
	if (element === snapshot) {
		return
	}

	var identity = snapshot.identity
	var type = snapshot.type
	var a = element.children
	var b = snapshot.children

	if (element.type === type) {
		switch (identity) {
			case Enum.text:
				if (a !== b) {
					Schedule.commit(fiber, Enum.content, host, parent, element, element.children = b)
				}
			case Enum.empty:
				return
			case Enum.component:
				return Schedule.commit(fiber, Enum.component, host, element, snapshot.props, a)
			case Enum.iterable:
				return children(fiber, host, element, 0, a, b)
			case Enum.thenable:
				return resolve(fiber, host, parent, element, snapshot, element.type = type, a, b)
		}

		children(fiber, host, element, 0, a, b)
		props(fiber, host, parent, element, object(element.props, element.props = snapshot.props))
	} else {
		if (element.identity === identity) {
			switch (element.type = type, identity) {
				case Enum.target:
					Schedule.commit(fiber, Enum.props, host, element, element, object(element.props, element.props = {}))
					Schedule.commit(fiber, Enum.portal, host, element, element, element)
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

	if (alen + blen === 0) {
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
		// step 1, common prefix/suffix/affix(rl)/affix(lr)
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
				Schedule.commit(fiber, Enum.mount, host, parent, atail, a[aidx])
				a.splice(aidx, 0, (a.splice(aend, 1), ++delta, atail))
				ahead = a[++aidx], bhead = b[++bidx], atail = a[aend]
				continue
			}
			if (ahead.key === btail.key) {
				update(fiber, host, parent, ahead, btail, a, aend)
				Schedule.commit(fiber, Enum.mount, host, parent, ahead, a[aend + 1])
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
					Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, btail = b[bidx], null), atail)
					a.splice(bidx++, 0, btail)
				}
			}
		} else if (bidx > bend) {
			while (aidx <= aend) {
				Schedule.commit(fiber, Enum.unmount, host, parent, ahead = a[aend], Node.destroy(fiber, parent, ahead, null))
				a.splice(aend--, 1)
			}
		} else if (((apos = aend + 1) - aidx) * ((bpos = bend + 1) - bidx) === 1) {
			replace(fiber, host, parent, ahead, bhead, a, aidx)
		} else {
			// step 3, keymap/unmount(rl)/unmount(lr)/mount(rl)/move(rl/lr)
			if (akeys === bkeys) {
				akeys = {}, bkeys = {}, delta = 0
				while (apos > aidx | bpos > bidx) {
					if (apos > aidx) { akeys[a[--apos].key] = apos }
					if (bpos > bidx) { bkeys[b[--bpos].key] = bpos }
				}
			}

			if (bkeys[atail.key] === undefined) {
				Schedule.commit(fiber, Enum.unmount, host, parent, atail, Node.destroy(fiber, parent, atail, null))
				a.splice((atail = aend > 0 ? a[aend - 1] : a[aend + 1], --alen, aend--), 1)
			} else if (bkeys[ahead.key] === undefined) {
				Schedule.commit(fiber, Enum.unmount, host, parent, ahead, Node.destroy(fiber, parent, ahead, null))
				a.splice((ahead = a[aidx + 1], --delta, --alen, --aend, aidx), 1)
			} else if (akeys[bhead.key] === undefined) {
				Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, bhead, null), ahead)
				a.splice((++delta, ++alen, ++aend, aidx), 0, bhead)
				ahead = a[++aidx], bhead = b[++bidx]
			} else {
				update(fiber, host, parent, amove = a[apos = (akeys[ahead.key] = akeys[bhead.key]) + delta], bhead, a, aidx)
				Schedule.commit(fiber, Enum.mount, host, parent, a[aidx] = amove, ahead)
				Schedule.commit(fiber, Enum.mount, host, parent, a[apos] = ahead, a[apos + 1])
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
	if (b !== null) {
		Schedule.commit(fiber, Enum.props, host, parent, a, b)
	}
}

/**
 * @param {object} a
 * @param {object} b
 * @return {object?}
 */
export function object (a, b) {
	if (a === b) {
		return null
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
			if (key !== 'style' || typeof next !== 'object') {
				diff[++size, key] = next
			} else if (next = object(prev || {}, next || {})) {
				diff[++size, key] = next
			}
		}
	}

	return size > 0 ? diff : null
}
