/**
 * Event Station
 *
 * @param {Node} node
 * @param {String} name
 * @param {Component} owner
 * @param {Function} handler
 */
function event (node, name, owner, handler) {
	node[name.toLowerCase()] = typeof handler !== 'function' ? null : (
		owner !== null ? function proxy (e) {
			eventBoundary(owner, handler, e);
		} : handler
	);
}
