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
			case 0: return returnBoundary(older, owner.componentWillReceiveProps(props), owner, null, true);
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
			case 1: return returnBoundary(older, owner.componentWillUpdate(props, state), owner, null, true);
			case 2: return returnBoundary(older, owner.componentDidUpdate(props, state), owner, null, false);
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
			case 1: return older.type(older.props);
			case 2: case 3: return older.owner.render(older.owner.props, older.owner.state);
		}
	} catch (err) {
		return errorBoundary(err, older, group > 1 ? older.owner : older.type, 3, group);
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
			case 0: return returnBoundary(older, owner.componentWillMount(node), owner, null, false);
			case 1: return returnBoundary(older, owner.componentDidMount(node), owner, null, true);
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
 * @param {Object|Node} param
 */
function callbackBoundary (older, owner, callback, param, type) {
	try {
		if (type === 0) {
			return callback.call(owner, param);
		} else {
			return returnBoundary(older, callback.call(owner, param), owner, null, false);
		}
	} catch (err) {
		errorBoundary(err, older, owner, 2, callback);
	}
}

/**
 * Events Boundary
 *
 * @param {Tree} older
 * @param {Component} owner
 * @param {Function} fn
 * @param {Event} e
 */
function eventBoundary (older, owner, fn, e) {
	try {
		return returnBoundary(older, fn.call(owner, e), owner, e, true);
	} catch (err) {
		errorBoundary(err, older, owner, 5, fn);
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
	if (state === void 0 || state === null || older.group < 2) {
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
	var component = '#unknown';
	var location;
	var newer;

	try {
		location = errorLocation(type, from) || component;

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

	errorMessage(component, location, message instanceof Error ? message.stack : message);

	if (type === 3 || type === 5) {
		return shape(newer, older, browser);
	}
}

/**
 * Error Location
 *
 * @param  {Number} type
 * @param  {Number|Function} from
 * @return {String?}
 */
function errorLocation (type, from) {
	if (typeof from === 'function') {
		return from.name;
	}

	switch (type) {
		case 0: {
			switch (from) {
				case 0: return 'componentWillReceiveProps';
				case 1: return 'getInitialState';
			}
			break;
		}
		case 1: {
			switch (from) {
				case 0: return 'shouldComponentUpdate';
				case 1: return 'componentWillUpdate';
				case 2: return 'componentDidUpdate';
			}
			break;
		}
		case 3: {
			return 'render';
			break;
		}
		case 4: {
			switch (from) {
				case 0: return 'componentWillMount';
				case 1: return 'componentDidMount';
				case 2: return 'componentWillUnmount';
			}
			break;
		}
		case 5: {
			return 'event';
		}
	}
}

/**
 * Error Message
 *
 * @param  {String} component
 * @param  {String} location
 * @param  {String} message
 */
function errorMessage (component, location, message) {
	console.error(
		message + '\n\n  ^^ Error caught in ' + '"' + component + '"' +
		' from "' + location + '" \n'
	);
}
