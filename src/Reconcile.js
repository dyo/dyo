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
	if (!(a.state = a === b)) {
		Utility.timeout(function () {
			if (!a.state) {
				Schedule.forward(function (host, parent, a, b) {
					Schedule.checkout(children, host, parent, c, b.children, null)
				}, host, parent, a, b)
			}
		}, b.props.timeout)
	}

	Utility.resolve(Schedule.suspend(fiber, type), function (value) {
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
			switch (a.uid) {
				case Enum.target:
					Schedule.commit(fiber, Enum.mount, a.type = b.type, Node.replace(a, object(a.props, a.props = {})), a, null)
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
	var alen = a.length
	var blen = b.length
	var aidx = 0
	var bidx = 0
	var aend = alen - 1
	var bend = blen - 1
	var ahead = a[aidx]
	var bhead = b[bidx]
	var atail = a[aend]
	var btail = b[bend]

	// step 1, prefix/suffix/affix
	outer: while (true) {
		// prefix(lr)
		while (ahead.key === bhead.key) {
			update(fiber, host, parent, ahead, bhead, a, aidx)
		  if (++aidx > aend | ++bidx > bend) { break outer }
		  ahead = a[aidx], bhead = b[bidx]
		}
		// suffix(rl)
		while (atail.key === btail.key) {
			update(fiber, host, parent, atail, btail, a, aend)
		  if (aidx > --aend | bidx > --bend) { break outer }
		  atail = a[aend], btail = b[bend]
		}
		// affix(rl)
		if (atail.key === bhead.key) {
			update(fiber, host, parent, atail, bhead, a, aidx)
			Schedule.commit(fiber, Enum.mount, host, parent, atail, a[aidx])
			a.splice(aidx, 0, (a.splice(aend, 1), atail))
			atail = a[aend], ahead = a[++aidx], bhead = b[++bidx]
		  continue
		}
		// affix(lr)
		if (ahead.key === btail.key) {
			update(fiber, host, parent, ahead, btail, a, aend)
			Schedule.commit(fiber, Enum.mount, host, parent, ahead, a[aend + 1])
			a.splice(aend, 0, (a.splice(aidx, 1), ahead))
			ahead = a[aidx], atail = a[--aend], btail = b[--bend]
		  continue
		}
		break
	}

	// step 2, mount/unmount/replace/sort
	if (aidx > aend++) {
		if (bidx <= bend++) {
			while (bidx < bend--) {
				Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, btail = b[bend], bend), a[aend])
				a.splice(aidx, 0, btail)
			}
		}
	} else if (bidx > bend++) {
		while (aidx < aend--) {
			Schedule.commit(fiber, Enum.unmount, host, parent, ahead = a[aend], Node.destroy(fiber, ahead))
			a.splice(aend, 1)
		}
	} else if ((aend - aidx) * (bend - bidx) === 1) {
		type(fiber, host, parent, ahead, bhead, a, aidx)
	} else {
		sort(fiber, host, parent, a, b, aidx, aend, bend)
	}
}

/**
 * @param {object} fiber
 * @param {object} host
 * @param {object} parent
 * @param {object} a
 * @param {object} b
 * @param {number} head
 * @param {number} alen
 * @param {number} blen
 */
export function sort (fiber, host, parent, a, b, head, alen, blen) {
	var anode = parent
	var bnode = parent
	var aend = alen
	var bend = blen
	var aidx = alen
	var bidx = blen
	var apos = 0
	var bpos = 0
	var akey = 0
	var bkey = 0
	var post = 0
	var amap = {}
	var bmap = {}
	var node = {}

	// step 3, keys
	while (aidx > head | bidx > head) {
		if (aidx > head) { amap[akey = (anode = a[--aidx]).key] = aidx }
		if (bidx > head) { bmap[bkey = (bnode = b[--bidx]).key] = bidx }
	}

	// step 4, sort
	while (aidx < aend | bidx < bend) {
		if ((akey = (anode = a[aidx]).key) !== (bkey = (bnode = b[bidx]).key)) {
			if (aidx < aend) {
				if (bmap[akey] == null) {
					Schedule.commit(fiber, Enum.unmount, host, parent, anode, Node.destroy(fiber, anode))
					a.splice((--aend, aidx), 1)
					continue
				}
			}
			if (bidx < bend) {
				if (amap[bkey] == null) {
					Schedule.commit(fiber, Enum.mount, host, parent, Node.create(fiber, host, parent, bnode, aidx), anode)
					a.splice((++aend, amap[bkey] = aidx), 0, bnode)
					continue
				}
			}
			if (aidx < aend) {
				if ((apos = bmap[akey]) != null) {
					if (anode !== a[apos]) {
						if (akey !== b[aidx + 1].key) {
							apos = apos < aend ? apos : aend - 1
							a.splice(aidx, 1)
							Schedule.commit(fiber, Enum.mount, host, parent, anode, a[apos])
							a.splice(apos, 0, anode)

							continue
						} else {
							aidx = aidx - 1
						}
					}
				}
			}
		}

		aidx = aidx < aend ? aidx + 1 : aidx
		bidx = bidx < bend ? bidx + 1 : bidx
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
