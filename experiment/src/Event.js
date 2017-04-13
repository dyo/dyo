/**
 * Event Station
 *
 * @param {String} type
 * @param {Function} listener
 * @param {Component} owner
 * @param {Node} node
 */
function event (type, listener, owner, node) {
	node[type.toLowerCase()] = typeof listener !== 'function' ? null : function (e) {
		eventBoundary(owner, listener, e);
	}
}
