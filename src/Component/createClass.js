/**
 * create class
 *
 * @public
 * 
 * @param  {(Object<string, any>|function(createElement): (Object<string, any>|function))} subject
 * @return {function(new:Component, Object<string, any>)}
 */
function createClass (subject) {
	// component cache
	if (subject.COMPCache !== void 0) {
		return subject.COMPCache;
	}

	// is function?
	var func = typeof subject === 'function';

	// extract shape of component
	var shape = func ? subject(createElement) : subject;
	var constructor = false;
	var render;

	if (shape.nodeType !== void 0 || typeof shape === 'function') {
		// render function
		render = shape.nodeType !== void 0 ? subject : shape;
		shape = { render: render };
	}
	else {
		// register that the shape has a constructor method
		constructor = shape.hasOwnProperty('constructor');
	}

	// create component class
	function component (props) {
		// constructor
		if (constructor) {
			this.constructor(props);
		}

		// extend Component
		Component.call(this, props); 
	}

	// inherit shape properties
	component.prototype = shape;

	// inherit Component methods
	shape.setState = Component.prototype.setState;
	shape.forceUpdate = Component.prototype.forceUpdate;

	// function shape, cache component
	if (func) {
		subject.COMPCache = component;
	}

	// stylesheet namespaced
	if (shape.stylesheet !== void 0) {
		// function name / displayName / random string
		shape.displayName = (func ? subject.name : shape.displayName) || ((Math.random()+1).toString(36).substr(2, 5));
	}

	return (component.constructor = Component, component);
}

