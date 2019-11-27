import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Element from './Element.js'
import * as Schedule from './Schedule.js'
import * as Node from './Node.js'

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} element
 * @param {number} identity
 * @param {object[]} children
 * @param {number} index
 */
export function context (fiber, host, parent, element, identity, children, index) {
	if (identity < Enum.text) {
		if (host.context !== null) {
			if (identity === Enum.component) {
				if (element.state === null) {
					update(fiber, element, parent, element = children[0], element, children, index)
				} else if (element.state[1] === false) {
					Schedule.commit(fiber, Enum.component, host, element.value = element, element.props, children)
				}
			} else {
				while (index < children.length) {
					update(fiber, host, parent, element = children[index], element, children, index++)
				}
			}
		}
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
	Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, snapshot, null), element)
	Schedule.commit(fiber, Enum.unmount, siblings[index] = snapshot, parent, element, Node.destroy(fiber, parent, element, null))
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
	var identity = snapshot.identity
	var type = snapshot.type
	var a = element.children
	var b = snapshot.children

	if (element === snapshot) {
		context(fiber, host, parent, element, identity, a, 0)
	} else if (element.type === type) {
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
				return children(fiber, host, element, a, b, 0)
		}

		children(fiber, host, element, a, b, 0)
		props(fiber, host, parent, element, object(element.props, element.props = snapshot.props))
	} else {
		if (element.identity === identity) {
			switch (element.type = type, identity) {
				case Enum.target:
					Schedule.commit(fiber, Enum.mount, host, element, element, Schedule.commit(fiber, Enum.target, host, element, element, element))
				case Enum.component:
					if (a.length === 1) {
						return update(fiber, host, parent, element, snapshot, element.props = snapshot.props, index)
					}
			}
		}

		replace(fiber, host, parent, element, snapshot, siblings, index)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object[]} a
 * @param {object[]} b
 * @param {number} offset
 */
export function children (fiber, host, parent, a, b, offset) {
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
	var bhead = Element.from(b[bidx], bidx, null)
	var atail = a[aend]
	var btail = Element.from(b[bend], bend, null)
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
				ahead = a[aidx], bhead = Element.from(b[bidx], bidx, null)
			}
			while (atail.key === btail.key) {
				update(fiber, host, parent, atail, btail, a, aend)
				if (aidx > --aend | bidx > --bend) { break outer }
				atail = a[aend], btail = Element.from(b[bend], bend, null)
			}
			if (atail.key === bhead.key) {
				update(fiber, host, parent, atail, bhead, a, aidx)
				Schedule.commit(fiber, Enum.mount, host, parent, atail, a[aidx])
				a.splice(aidx, 0, (a.splice(aend, 1), ++delta, atail))
				ahead = a[++aidx], atail = a[aend], bhead = Element.from(b[++bidx], bidx, null)
				continue
			}
			if (ahead.key === btail.key) {
				update(fiber, host, parent, ahead, btail, a, aend)
				Schedule.commit(fiber, Enum.mount, host, parent, ahead, a[aend + 1])
				a.splice(aend, 0, (a.splice(aidx, 1), --delta, ahead))
				atail = a[--aend], ahead = a[aidx], btail = Element.from(b[--bend], bend, null)
				continue
			}
		}

		// step 2, noop/mount/unmount/replace
		if (aidx > aend) {
			if (bidx <= bend) {
				atail = a[aend + 1]
				while (bidx <= bend) {
					Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, btail = Element.from(b[bidx], bidx, null), null), atail)
					a.splice(bidx++, 0, btail)
				}
			}
		} else if (bidx > bend) {
			while (aidx <= aend) {
				Schedule.commit(fiber, Enum.unmount, host, parent, ahead = a[aend], Node.destroy(fiber, parent, ahead, null))
				a.splice(aend--, 1)
			}
		} else if (((apos = aend + 1) - aidx) * ((bpos = bend + 1) - bidx) === 1) {
			replace(fiber, host, parent, ahead, Element.from(bhead, aidx, null), a, aidx)
		} else {
			// step 3, keymap/unmount(rl)/unmount(lr)/mount(rl)/move(rl/lr)
			if (akeys === bkeys) {
				akeys = {}, bkeys = {}, delta = 0
				while (apos > aidx | bpos > bidx) {
					if (apos > aidx) { akeys[a[--apos].key] = apos }
					if (bpos > bidx) { bkeys[(b[--bpos] = Element.from(b[bpos], bpos, null)).key] = bpos }
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
