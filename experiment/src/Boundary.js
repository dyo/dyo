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
			case 0: return owner.componentWillReceiveProps(props);
			case 1: return owner.getInitialState(props);
			case 2: return owner.getDefaultProps(props);
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
			case 1: return owner.componentWillUpdate(props, state);
			case 2: return owner.componentDidUpdate(props, state);
		}
	} catch (err) {
		errorBoundary(err, owner, 1, type);
	}
}

/**
 * Render Boundary
 *
 * @param  {Component|Tree} owner
 * @param  {Number} cast
 * @return {Tree}
 */
function renderBoundary (owner, cast) {
	try {
		switch (cast) {
			case 1: return owner.render(owner.props, owner.state);
			case 2: return owner.type(owner.props || object);
		}
	} catch (err) {
		return errorBoundary(err, cast === 1 ? owner : owner.type, 3, cast);
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
			return document.createElement(newer.tag);
		}
		return document.createElementNS(newer.xmlns === xmlns, newer.tag);
	} catch (err) {
		return errorBoundary(err, owner, 5, (newer.flag = 3, 0));
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
			case 0: return owner.componentWillMount();
			case 1: return owner.componentDidMount();
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
function callbackBoundary (owner, callback, param) {
	try {
		return callback.call(owner, param);
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
		return fn.call(owner, owner.props, owner.state, e);
	} catch (err) {
		errorBoundary(err, owner, 5, fn);
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
	var name = '#unknown';
	var location = name;
	var tree;

	try {
		if (typeof from !== 'function') {
			switch (type) {
				case 0: {
					switch (from) {
						case 0: location = 'componentWillReceiveProps'; break;
						case 1: location = 'getInitialState'; break;
						case 2: location = 'getDefaultProps'; break;
					}
					break;
				}
				case 1: {
					switch (from) {
						case 0: location = 'shouldComponentUpdate'; break;
						case 1: location = 'componentWillUpdate'; break;
						case 2: location = 'componentDidUpdate'; break;
					}
					break;
				}
				case 3: {
					switch (from) {
						case 1: location = 'render'; break;
						case 2: location = 'function'; break;
					}
					break;
				}
				case 4: {
					switch (from) {
						case 0: location = 'componentWillMount'; break;
						case 1: location = 'componentDidMount'; break;
						case 2: location = 'componentWillUnmount'; break;
					}
					break;
				}
				case 5: {
					location = 'render';
					break;
				}
				case 6: {
					location = from;
					break;
				}
			}
		} else {
			location = from.name;
		}

		if (owner !== null) {
			if (owner.componentDidThrow !== void 0) {
				tree = owner.componentDidThrow({location: location, message: message});
			}

			if (type === 3 && from === 2) {
				name = owner.name;
			} else {
				name = owner.constructor.name;
			}
		}
	} catch (err) {
		location = 'componentDidThrow';
		message = err;
	}

	error(name, location, message instanceof Error ? message.stack : message);

	if (type === 3 || type === 5) {
		return shape(tree === void 0 ? element('noscript') : tree, owner, false);
	}
}

/**
 * Error Logger
 *
 * @param  {String} component
 * @param  {String} location
 * @param  {String} message
 */
function error (component, location, message) {
	console.error(
		message+'\n\n  ^^ Error caught in Component '+'"'+component+'"'+
		' from "'+location+'" \n'
	);
}
