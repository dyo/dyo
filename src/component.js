/**
 * ---------------------------------------------------------------------------------
 * 
 * component
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * findDOMNode
 * 
 * @param  {Object} component
 * @return {(Node|boolean)}
 */
function findDOMNode (component) {
	return component._vnode && component._vnode._node;
}


/**
 * unmountComponentAtNode
 * 
 * @param  {Node} container
 */
function unmountComponentAtNode (container) {
	container.textContent = '';
}


/**
 * component class
 * 
 * @param {Object=} props
 */
function Component (props) {
	if (props) {
		// if dev env and has propTypes, validate props
		if (development) {
			var propTypes = this.propTypes || this.constructor.propTypes;

			if (propTypes) {				
				validatePropTypes(
					props, 
					propTypes, 
					this.displayName || this.constructor.name
				);
			}
		}

		// componentWillReceiveProps lifecycle
		if (this.componentWillReceiveProps) { 
			this.componentWillReceiveProps(props); 
		}

		// assign props
		this.props = props;
	} else {
		this.props = (this.getDefaultProps && this.getDefaultProps()) || {};
	}

	this.state = (this.getInitialState && this.getInitialState()) || {};

	this.refs = this._vnode = null;
}


/**
 * component prototype
 * 
 * @type {Object}
 */
Component.prototype = Object.create(null, {
	setState: { value: setState },
	forceUpdate: { value: forceUpdate },
	withAttr: { value: withAttr }
});


/**
 * set state
 * 
 * @param {Object}    newState
 * @param {function=} callback
 */
function setState (newState, callback) {
	if (this.shouldComponentUpdate && this.shouldComponentUpdate(this.props, newState) === false) {
		return;
	}

	// update state
	for (var name in newState) {
		this.state[name] = newState[name];
	}		

	this.forceUpdate();

	// callback, call
	if (callback) {
		callback(this.state);
	}
}


/**
 * force an update
 *
 * @return {void}
 */
function forceUpdate () {
	if (this._vnode != null) {
		// componentWillUpdate lifecycle
		if (this.componentWillUpdate) {
			this.componentWillUpdate(this.props, this.state);
		}

		// patch update
		patch(retrieveRender(this), this._vnode);

		// componentDidUpdate lifecycle
		if (this.componentDidUpdate) {
			this.componentDidUpdate(this.props, this.state);
		}
	}
}


/**
 * withAttr
 * 
 * @param  {(any[]|string)}      props
 * @param  {function[]|function} setters
 * @param  {function=}           callback
 * @return {function=}           
 */
function withAttr (props, setters, callback) {
	var component = this, isarray = typeof props === 'object';

	return function () {
		// array of bindings
		if (isarray) {
			for (var i = 0, length = props.length; i < length; i++) {
				updateAttr(this, props[i], setters[i]);
			}
		} else {
			updateAttr(this, props, setters);
		}

		callback ? callback(component) : component.forceUpdate();
	}
}


/**
 * withAttr(update attribute)
 * 
 * @param  {Node}           target
 * @param  {(string|any[])} prop
 * @param  {function}       setter
 */
function updateAttr (target, prop, setter) {
	var value;

	if (typeof prop === 'string') {
		value = prop in target ? target[prop] : target.getAttribute(prop);

		if (value != null) { 
			setter(value); 
		}
	} else {
		value = prop();
		
		if (value != null) {
			setter in target ? target[setter] = value : target.setAttribute(setter, value);
		}
	}
}


/**
 * create component
 * 
 * @param  {(Object|function)} subject
 * @return {function}
 */
function createClass (subject) {
	// component cache
	if (subject._component) {
		return subject._component;
	}

	var func  = typeof subject === 'function';
	var shape = func ? subject() : subject;

	if (shape.nodeType) {
		var vnode = shape;
			shape = { render: function () { return vnode; } };
	}
	
	function component (props) {
		Component.call(this, props);
		binder(this);
	}

	var prototype = component.prototype = Object.create(Component.prototype);
	var methods = [];
	var length = 0;
	var auto = true;

	function binder (ctx) {
		var i = length;

		while (i--) {
			var name = methods[i];

			ctx[name] = ctx[name].bind(ctx);
		}
	}

	each(shape, function (value, name) {
		if (name !== 'statics') {
			prototype[name] = value;

			if (
				auto && typeof 
				value === 'function' &&

				name !== 'render' && 
				name !== 'stylesheet' && 

				name !== 'getInitialState' && 
				name !== 'getDefaultProps' && 
				name !== 'shouldComponentUpdate' &&

				name !== 'componentWillReceiveProps' &&
				name !== 'componentWillUpdate' &&
				name !== 'componentDidUpdate' &&
				name !== 'componentWillMount' &&
				name !== 'componentDidMount' &&
				name !== 'componentWillUnmount'
			) {
				methods[length++] = name;
			}
		}
	});

	if (func) {
		if (!shape.displayName) {
			component.prototype.displayName = getDisplayName(subject);
		}

		subject._component = component;
	}

	if (shape.statics) {
		each(shape.statics, function (value, name) {
			(shape === subject ? component : subject)[name] = value;
		});
	}

	return component.constructor = prototype.constructor = component;
}


/**
 * retrieve function name
 * 
 * @param  {function} subject
 * @return {string}
 */
function getDisplayName (subject) {
	// the regex may return nothing, ['',''] insures we can always retrieves something
	var displayName = (/function ([^(]*)/.exec(subject.valueOf()) || ['',''])[1];

	return displayName === '' && subject.name !== void 0 ? subject.name : displayName;
}

