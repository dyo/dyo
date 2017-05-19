/**
 * Data Boundary
 *
 * @param  {Tree} older
 * @param  {Component} owner
 * @param  {Number} type
 * @param  {Object} props
 * @return {Object?}
 */
function dataBoundary (older, owner, type, props) {
	try {
		switch (type) {
			case 0: returnBoundary(older, owner.componentWillReceiveProps(props), owner, null, true);
			case 1: return owner.getInitialState(props);
		}
	} catch (err) {
		errorBoundary(err, older, owner, 0, type);
	}
}

/**
 * Update Boundary
 *
 * @param  {Tree} older
 * @param  {Component} owner
 * @param  {Number} type
 * @param  {Object} props
 * @param  {Object} state
 * @return {Boolean?}
 */
function updateBoundary (older, owner, type, props, state) {
	try {
		switch (type) {
			case 0: return owner.shouldComponentUpdate(props, state);
			case 1: returnBoundary(older, owner.componentWillUpdate(props, state), owner, null, true);
			case 2: returnBoundary(older, owner.componentDidUpdate(props, state), owner, null, false);
		}
	} catch (err) {
		errorBoundary(err, older, owner, 1, type);
	}
}

/**
 * Render Boundary
 *
 * @param  {Tree} older
 * @param  {Number} group
 * @return {Tree}
 */
function renderBoundary (older, group) {
	try {
		if (older.yield !== null) {
			return older.yield();
		}

		switch (group) {
			case FUNCTION: return older.type(older.props);
			default: return older.owner.render(older.owner.props, older.owner.state);
		}
	} catch (err) {
		return errorBoundary(err, older, group === CLASS ? older.owner : older.type, 3, group);
	}
}

/**
 * Mount Boundary
 *
 * @param {Tree} older
 * @param {Component} owner
 * @param {Node} node
 * @param {Number} type
 */
function mountBoundary (older, owner, node, type) {
	try {
		switch (type) {
			case 0: returnBoundary(older, owner.componentWillMount(node), owner, null, false);
			case 1: returnBoundary(older, owner.componentDidMount(node), owner, null, true);
			case 2: return owner.componentWillUnmount(node);
		}
	} catch (err) {
		errorBoundary(err, older, owner, 4, type);
	}
}

/**
 * Callback Boundary
 *
 * @param {Tree} older
 * @param {Function} callback
 * @param {Component} owner
 * @param {Object|Node} data
 * @param {Number} type
 */
function callbackBoundary (older, owner, callback, data, type) {
	try {
		if (type === 0) {
			return callback.call(owner, data);
		} else {
			returnBoundary(older, callback.call(owner, data), owner, null, false);
		}
	} catch (err) {
		errorBoundary(err, older, owner, 2, callback);
	}
}

/**
 * Events Boundary
 *
 * @param {Event} e
 */
function eventBoundary (e) {
	var handlers = this.that;
	var host = handlers.host;
	var func = handlers[e.type];

	if (func !== null && func !== void 0) {
		if (host !== void 0) {
			try {
				var owner = host.owner;
				var result = func.call(owner, e);

				if (result !== void 0) {
					returnBoundary(host, result, owner, e, true);
				}
			} catch (err) {
				errorBoundary(err, host, owner, 5, func);
			}
		} else {
			func.call(this, e);
		}
	}
}

/**
 * Return Boundary
 *
 * @param {Tree} older
 * @param {(Object|Promise)?} state
 * @param {Component} owner
 * @param {Event?} e
 * @param {Boolean} sync
 */
function returnBoundary (older, state, owner, e, sync) {
	if (state === void 0 || state === null || older.group !== CLASS) {
		return;
	}

	if (sync === true) {
		owner.setState(state);
		return;
	}

	requestIdleCallback(function () {
		owner.setState(state);
	});
}

/**
 * Error Boundary
 *
 * @param  {Error|String} message
 * @param  {Tree} older
 * @param  {Component} owner
 * @param  {Number} type
 * @param  {Number|Function} from
 * @return {Tree?}
 */
function errorBoundary (message, older, owner, type, from) {
	var unknown = '#unknown';
	var component = unknown;
	var location = unknown;
	var newer;

	try {
		if (typeof from === 'function') {
			location = from.name;
		} else {
			switch (type) {
				case 0: {
					switch (from) {
						case 0: location = 'componentWillReceiveProps';
						case 1: location = 'getInitialState';
					}
					break;
				}
				case 1: {
					switch (from) {
						case 0: location = 'shouldComponentUpdate';
						case 1: location = 'componentWillUpdate';
						case 2: location = 'componentDidUpdate';
					}
					break;
				}
				case 3: {
					location = 'render';
					break;
				}
				case 4: {
					switch (from) {
						case 0: location = 'componentWillMount';
						case 1: location = 'componentDidMount';
						case 2: location = 'componentWillUnmount';
					}
					break;
				}
				case 5: {
					location = 'event';
					break;
				}
			}
		}

		if (owner !== null) {
			if (owner.componentDidThrow !== void 0) {
				newer = owner.componentDidThrow({location: location, message: message});
			}

			component = typeof owner === 'function' ? owner.name : owner.constructor.name;
		}
	} catch (err) {
		message = err;
		location = 'componentDidThrow';
	}

	console.error(
		(message instanceof Error ? message.stack : message) +
		'\n\n  ^^ Error caught in '+'"'+component+'"'+' from "'+location+'" \n'
	);

	if (type === 3) {
		if (newer === void 0 && older !== SHARED && older.node !== null) {
			// last non-error state
			return older;
		} else {
			// authored/default error state
			return shape(newer, older, true);
		}
	}
}
