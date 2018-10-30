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
 * @param {*} c
 */
export function resolve (fiber, host, parent, a, b, c, type) {
	// mounting/updating?
	if (!(a.state = a === b)) {
		Utility.timeout(function () {
			// stale?
			if (!a.state) {
				Schedule.forward(function (host, parent, a, b) {
					Schedule.checkout(children, host, parent, c, b.children, null)
				}, host, parent, a, b)
			}
		}, b.props.timeout)
	}

	Utility.resolve(Schedule.suspend(fiber, type), function (value) {
		// stale?
		if (a.state = a.type === type) {
			Schedule.resolve(fiber, Enum.children, host, parent, c, Element.resolve(value), Schedule.commit)
		}
	}, function (error) {

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
export function update (fiber, host, parent, a, b, c, idx) {
	if (a.type === b.type) {
		switch (a.uid) {
			case Enum.text:
			case Enum.comment:
				if (a.children !== b.children) {
					Schedule.commit(fiber, Enum.content, host, a, a.children = b.children, a)
				}
			case Enum.empty:
				return
			case Enum.component:
				return Component.resolve(fiber, host, a, b, {})
			case Enum.thenable:
				return resolve(fiber, host, parent, a, b, a.children, a.type = b.type)
		}

		children(fiber, host, a, a.children, b.children)
		props(fiber, host, a, object(a.props, a.props = b.props))
	} else {
		if (a.uid === b.uid) {
			// reparent/thenable?
			switch (a.uid) {
				case Enum.target:
					Schedule.commit(fiber, Enum.mount, a.type = b.type, Node.replace(a, object(a.props, a.props = {}), idx), a, a)
				case Enum.thenable:
					return update(fiber, host, parent, a, b, c, idx)
			}
		}

		type(fiber, host, parent, a, b, c, idx)
	}
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
	Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, c[idx] = b, idx), a)
	Schedule.commit(fiber, Enum.unmount, host, parent, a, Node.destroy(fiber, a))
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 */
export function props (fiber, host, parent, a) {
	if (a) {
		Schedule.commit(fiber, Enum.props, host, parent, a, Enum.update)
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
	var apos = 0
	var bpos = 0
	var aidx = 0
	var bidx = 0
	var alen = a.length
	var blen = b.length
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
		outer: {
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
					Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, btail = b[bidx], bidx), atail)
					a.splice(bidx++, 0, btail)
				}
			}
		} else if (bidx > bend) {
			while (aidx <= aend) {
				Schedule.commit(fiber, Enum.unmount, host, parent, ahead = a[aend], Node.destroy(fiber, ahead))
				a.splice(aend--, 1)
			}
		} else if (((apos = aend + 1) - aidx) * ((bpos = bend + 1) - bidx) === 1) {
			type(fiber, host, parent, ahead, bhead, a, aidx)
		} else {
			// step 3, keymap/unmount/mount/move
			if (akeys === bkeys) {
				akeys = {}, bkeys = {}, delta = 0
				while (apos > aidx | bpos > bidx) {
					if (apos > aidx) { akeys[a[--apos].key] = apos }
					if (bpos > bidx) { bkeys[b[--bpos].key] = bpos }
				}
			}

			if (bkeys[atail.key] === undefined) {
				Schedule.commit(fiber, Enum.unmount, host, parent, atail, Node.destroy(fiber, atail))
				a.splice((atail = aend > 0 ? a[aend - 1] : a[aend + 1], aend--), 1)
			} else if (bkeys[ahead.key] === undefined) {
				Schedule.commit(fiber, Enum.unmount, host, parent, ahead, Node.destroy(fiber, ahead))
				a.splice((ahead = a[aidx + 1], --delta, --aend, aidx), 1)
			} else if (akeys[bhead.key] === undefined) {
				Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, bhead, aidx), ahead)
				a.splice((++delta, ++aend, aidx), 0, bhead)
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
