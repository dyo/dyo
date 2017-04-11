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
			var result = eventBoundary(owner, listener, e);

			if (result !== void 0) {
				if (e.defaultPrevented !== true && e.allowDefault !== true) {
					e.preventDefault();
				}

				if (result !== false) {
					owner.setState(result);
				}
			}
		}, false);
	} else {
		node.addEventListener(type, listener, false);
	}
}
