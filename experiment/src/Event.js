/**
 * Event Station
 *
 * @param {String} type
 * @param {Function} listener
 * @param {Component} owner
 * @param {Node} node
 */
function event (type, listener, owner, node) {
	if (owner !== null) {
		node.addEventListener(type, function (e) {
			eventBoundary(owner, listener, e);
		}, false);
	} else {
		node.addEventListener(type, listener, false);
	}
}
