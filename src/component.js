/**
 * ---------------------------------------------------------------------------------
 * 
 * component
 * 
 * ---------------------------------------------------------------------------------
 */


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

	var func = typeof subject === 'function', candidate = func ? subject() : subject;
	
	// if vnode passed as argument, create blueprint with render that returns the vnode
	var blueprint = (
		candidate.render !== undefined ? candidate : { render: function () { return candidate; } }
	);

	// create class, reference to prototype object
	var Component = createComponent(),
		prototype = Component.prototype;

	// retrieve method names, we use this for auto binding
	var methods = [], length = 0;

	each(blueprint, function (value, name) {
		if (value !== null && name !== 'statics') {
			prototype[name] = value;

			if (typeof value === 'function' && name !== 'render') {
				methods[length++] = name;
			}
		}
	});

	// instantiates and returns a component
	function Factory (props) {
		var component = new Component(props),
			index     = length;

		while (index--) {
			var name = methods[index];

			component[name] = component[name].bind(component);
		}

		return component;
	}

	// if static methods, assign
	if (candidate.statics !== undefined) {
		// if subject is not a function blueprint, else...
		var destination = blueprint === subject ? Factory : subject;

		each(blueprint.statics, function (value, name) {
			destination[name] = value;
		});
	}

	// if function blueprint, cache factory
	if (func) {
		// extract displayName from function name
		if (prototype.displayName === undefined) {
			prototype.displayName = getDisplayName(subject);
		}

		subject._component = Factory;
	}

	// add constructor signature
	Factory.constructor = Component;

	return Factory;
}


/**
 * componentClass factory
 * 
 * @return {Class}
 */
function createComponent () {
	function Component (props) {
		this.state = this.getInitialState === undefined ? {} : this.getInitialState();

		if (props !== undefined) {				
			// componentWillReceiveProps lifecycle
			if (this.componentWillReceiveProps !== undefined) { 
				this.componentWillReceiveProps(props); 
			}

			// if dev env and has propTypes, validate props
			if (development) {
				var propTypes = this.propTypes || this.constructor.propTypes;

				if (propTypes !== undefined) {
					validatePropTypes(props, propTypes, this.displayName || this.constructor.name);
				}
			}

			// assign props
			this.props = props;
		} else {
			this.props = this.getDefaultProps === undefined ? {} : this.getDefaultProps();
		}

		this.refs   = null;
		this._vnode = null;
	}

	Component.prototype = {
		setState:    setState,
		forceUpdate: forceUpdate,
		withAttr:    withAttr,
		bind:        bind
	}

	return Component;
}


/**
 * auto bind methods
 * 
 * @return {arguments} ...methods
 */
function bind () {
	for (var i = 0, length = arguments.length; i < length; i++) {
		var name = arguments[i];

		this[name] = this[name].bind(this);
	}
}


/**
 * set state
 * 
 * @param {Object}    newState
 * @param {function=} callback
 */
function setState (newState, callback) {
	if (this.shouldComponentUpdate !== undefined && 
		this.shouldComponentUpdate(this.props, newState) === false
	) {
		return;
	}

	// update state
	for (var name in newState) {
		this.state[name] = newState[name];
	}		

	this.forceUpdate();

	// callback, call
	if (callback !== undefined && typeof callback === 'function') {
		callback(this.state);
	}
}


/**
 * force an update
 *
 * @return {void}
 */
function forceUpdate () {
	if (this._vnode !== undefined) {
		// componentWillUpdate lifecycle
		if (this.componentWillUpdate !== undefined) {
			this.componentWillUpdate(this.props, this.state);
		}

		var newNode = retrieveVNode(this), 
			oldNode = this._vnode;

		// never executes more than once
		if (oldNode.type !== newNode.type) {
			oldNode.type = newNode.type;
		}

		// patch update
		update(newNode, oldNode);

		// componentDidUpdate lifecycle
		if (this.componentDidUpdate !== undefined) {
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
	var component = this;

	function updateAttr (target, prop, setter) {
		var value;

		if (typeof prop === 'string') {
			value = prop in target ? target[prop] : target.getAttribute(prop);

			if (value != null) { setter(value); }
		} else {
			value = prop();
			
			if (value != null) {
				setter in target ? target[setter] = value : target.setAttribute(setter, value);
			}
		}
	}

	return function (event) {
		var target = this || event.currentTarget;

		// array of bindings
		if (isArray(props)) {
			for (var i = 0, length = props.length; i < length; i++) {
				updateAttr(target, props[i], setters[i]);
			}
		} else {
			updateAttr(target, props, setters);
		}

		if (callback !== undefined) {
			callback(component);
		} else {
			component.forceUpdate();
		}
	}
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

	return displayName === '' && subject.name !== undefined ? subject.name : displayName;
}


/**
 * findDOMNode
 * 
 * @param  {Object} component
 * @return {(Node|bool)}
 */
function findDOMNode (component) {
	return (
		component._vnode && component._vnode._el
	);
}


/**
 * unmountComponentAtNode
 * @param  {Node} container
 * @return {}
 */
function unmountComponentAtNode (container) {
	container.textContent = (
		''
	);
}