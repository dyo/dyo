import * as Constant from './Constant.js'
import * as Reconcile from './Reconcile.js'
import * as Commit from './Commit.js'
import * as Component from './Component.js'
import * as Lifecycle from './Lifecycle.js'

/**
 * The `commit` function is the entry port for every update
 * the process identifier `pid` uses the sign bit to represent the priority of the commit and the
 * rest of its significant bits as the unique identifier.
 *
 * Every commit is represented by a process id(pid), one identifier, and three payloads(a, b, c).
 *
 * For example:
 *
 * 		content(update text content) could be (a = element, b = (previous value), b = (previous value))
 *   	mount(insert/append a node) could be (a = parent, b = element, c = (sibling | null))
 *    unmount(remove node) could be (a = parent, b = eleemnt, c = index)
 *
 *  	etc...
 *
 * High priority updates are represented when `pid` is equal or greater than zero.
 * In this case `commit` is a opaque noop router between commits.
 *
 * Low priority updates are represented when `pid` is less than zero,
 * This branches into `queue` where the following takes place.
 *
 * When the last commit is an unresolved i/o dependency
 * The current commit is queued to retry a queue when it is resolved.
 *
 * Otherwise if the current commit is not a `callback` commit
 * the commit is pushed into its respective bucket.
 *
 * A `callback` commit then triggers a complete flush of the commit stream
 * represented by that `pid`.
 *
 * This flushes all queued commits back to `commit` with the signed bit fliped to represent high priority.
 *
 * If the callback commit has a function to be called the function is called with the supplied
 * arguments else noop.
 *
 * ATM of this writing there is only one bucket(the root bucket).
 *
 * The implementation is reasonably simple but extensible as requirements change without affecting other
 * pieces of the code base.
 */

export var queue = []

/**
 * @param {number} pid
 * @param {number} id
 * @param {*} a
 * @param {*} b
 * @param {*} c
 */
export function commit (pid, id, a, b, c) {
	if (pid < 0) {
		return enqueue(pid, id, a, b, c)
	}

	switch (id) {
		case Constant.update:
			return Reconcile.update(pid, a, b, c)
		case Constant.component:
			return Component.update(pid, a, b, c)
		case Constant.callback:
			return Lifecycle.callback(a, b)
		case Constant.props:
			return Commit.props(a, b, c)
		case Constant.content:
			return Commit.content(a, c)
		case Constant.mount:
			return Commit.mount(a, b, c)
		case Constant.unmount:
			return Commit.unmount(a, b)
	}
}

/**
 * TODO: schedule low priority updates seperatly from high priority updates
 * given that high priority updates are commited immediatly.
 *
 * @param {number} pid
 * @param {number} id
 * @param {*} a
 * @param {*} b
 * @param {*} c
 */
export function enqueue (pid, id, a, b, c) {
	// while the last update is an unresolved I/O dependency
	// enqueue to add after the dependency has been resolved
	if (queue[queue.length].id === Constant.thenable) {
		if (!queue[queue.length].a.resolved) {
			return queue[queue.length].b.then(enqueue.bind(null, pid, id, a, b, c))
		}
	}

	// eof
	if (id !== Constant.callback) {
		queue.push({pid: pid, id: id, a: a, b: b, c: c})
	} else {
		for (var i = 0, j; i < queue.length; ++i) {
			commit(0, (j = queue[i]).pid, j.id, j.a, j.b, j.c)
		}
	}
}

/**
 * @return {number}
 */
export function identity () {
	return queue.length + 1
}
