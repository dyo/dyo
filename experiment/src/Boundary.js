/**
 * Data Boundary
 *
 * @param  {Component} owner
 * @param  {Number} type
 * @param  {Object} props
 * @return {Object?}
 */
function dataBoundary (owner, type, props) {
	try {
		switch (type) {
			case 0: return returnBoundary(owner.componentWillReceiveProps(props), owner, null, true);
			case 1: return owner.getInitialState(props);
		}
	} catch (err) {
		errorBoundary(err, owner, 0, type);
	}
}

/**
 * Update Boundary
 *
 * @param  {Component} owner
 * @param  {Number} type
 * @param  {Object} props
 * @param  {Object} state
 * @return {Boolean?}
 */
function updateBoundary (owner, type, props, state) {
	try {
		switch (type) {
			case 0: return owner.shouldComponentUpdate(props, state);
			case 1: return returnBoundary(owner.componentWillUpdate(props, state), owner, null, true);
			case 2: return returnBoundary(owner.componentDidUpdate(props, state), owner, null, false);
		}
	} catch (err) {
		errorBoundary(err, owner, 1, type);
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
			return coroutine(older, group);
		}
		switch (group) {
			case 1: return older.type(older.props);
			case 2: case 3: return older.owner.render(older.owner.props, older.owner.state);
		}
	} catch (err) {
		return errorBoundary(err, group > 1 ? older.owner : older.type, 3, group);
	}
}

/**
 * Node Boundary
 *
 * @param  {Number} flag
 * @param  {Tree} newer
 * @param  {String?} xmlns
 * @param  {Component} owner
 * @return {Node}
 */
function nodeBoundary (flag, newer, xmlns, owner) {
	try {
		if (xmlns === null) {
			return createElement(newer.tag);
		} else {
			return createElementNS(newer.xmlns === xmlns, newer.tag);
		}
	} catch (err) {
		return errorBoundary(err, owner, newer.flag = 3, typeof owner === 'function' ? 2 : 1);
	}
}

/**
 * Mount Boundary
 *
 * @param {Component} owner
 * @param {Number} type
 */
function mountBoundary (owner, type) {
	try {
		switch (type) {
			case 0: return returnBoundary(owner.componentWillMount(), owner, null, false);
			case 1: return returnBoundary(owner.componentDidMount(), owner, null, true);
			case 2: return owner.componentWillUnmount();
		}
	} catch (err) {
		errorBoundary(err, owner, 4, type);
	}
}

/**
 * Callback Boundary
 *
 * @param {Function} callback
 * @param {Component} owner
 * @param {Object|Node} param
 */
function callbackBoundary (owner, callback, param, type) {
	try {
		if (type === 0) {
			return callback.call(owner, param);
		} else {
			return returnBoundary(callback.call(owner, param), owner, null, false);
		}
	} catch (err) {
		errorBoundary(err, owner, 2, callback);
	}
}

/**
 * Events Boundary
 *
 * @param {Component} owner
 * @param {Function} fn
 * @param {Event} e
 */
function eventBoundary (owner, fn, e) {
	try {
		return returnBoundary(fn.call(owner, owner.props, owner.state, e), owner, e, true);
	} catch (err) {
		errorBoundary(err, owner, 5, fn);
	}
}

/**
 * Return Boundary
 *
 * @param  {(Object|Promise)?} state
 * @param  {Component} owner
 * @param  {Event?} e
 * @param  {Boolean} sync
 */
function returnBoundary (state, owner, e, sync) {
	if (state === void 0 || state === null || owner === null || owner.UUID === void 0) {
		return;
	}

	if (e !== null && e.defaultPrevented !== true && e.allowDefault !== true) {
		e.preventDefault();
	}

	if (state !== false) {
		if (sync === true) {
			owner.setState(state);
		} else {
			schedule(function () {
				owner.setState(state);
			});
		}
	}
}

/**
 * Error Boundary
 *
 * @param  {Error|String} message
 * @param  {Component} owner
 * @param  {Number} type
 * @param  {Number|Function} from
 * @return {Tree?}
 */
function errorBoundary (message, owner, type, from) {
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
		return shape(newer, owner.older);
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
			switch (from) {
				case 1: return 'render';
				case 2: return 'function';
			}
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
			return 'render';
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
		message+'\n\n  ^^ Error caught in Component '+'"'+component+'"'+
		' from "'+location+'" \n'
	);
}
