/**
 * create class
 * 
 * @param  {(Object|function(createElement))} subject
 * @return {function}
 */
function createClass (subject) {
	if (subject.COMPCache) {
		return subject.COMPCache; 
	}

	var func = typeof subject === 'function';
	var shape = func ? subject(createElement) : subject;
	var init = false;
	var render;

	if (typeof shape === 'function') {
		render = shape; 
		shape = { render: render };
	} else {
		init = shape.hasOwnProperty('constructor');
	}

	function component (props) {
		// constructor
		init && this.constructor(props);

		// extend Component
		Component.call(this, props); 
	}

	// extend Component prototype
	component.prototype = shape;

	shape.setState = Component.prototype.setState;
	shape.forceUpdate = Component.prototype.forceUpdate;

	// function component, cache created component
	if (func) {
		subject.COMPCache = component;
		component.constructor = subject;
	}
	
	if (!init) {
		shape.constructor = component;
	}

	return component;
}

