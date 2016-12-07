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

	var func = typeof subject === 'function';

	var shape = func ? (subject.prototype = Component.prototype, new subject(Component)) : subject;
	var isconstuct = shape.constructor !== Object;

	if (shape.nodeType) {
		var vnode = shape; shape = { render: function () { return vnode; } };
	}
	
	// we want to allow 2 type of function constructors
	// 1. one that returns an object `{...}`
	// 2. one that returns an instance `this[method] = ...`
	if (func && isconstuct) {
		// returns an instance, let the constructor handle binding
		var component = function createClass (props) { Component.call(this, props); };
		component.prototype = shape;
	} else {
		// to avoid mutating Component.prototype we add it to the prototype chain
		var prototype = Object.create(Component.prototype);

		// returns a object
		var component = function createClass (props) { Component.call(this, props), bind(this); }

		var methods = [];
		var length = 0;
		var auto = true;

		var bind = function (ctx) {
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

		component.prototype = prototype;
		prototype.constructor = component;
	}

	if (isconstuct === false) {
		component.constructor = component;
	}

	if (func) {
		subject._component = component;
	}

	if (shape.statics) {
		each(shape.statics, function (value, name) {
			(shape === subject ? component : subject)[name] = value;
		});
	}

	return component;
}

