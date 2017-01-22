/**
 * create class
 *
 * @public
 * 
 * @param  {(Object<string, any>|function(createElement): (Object<string, any>|function))} subject
 * @return {function(new:Component, Object<string, any>)}
 */
function createClass (subject) {
	// empty class
	if (subject == null) {
		subject = createEmptyShape();
	}

	// component cache
	if (subject.COMPCache !== void 0) {
		return subject.COMPCache;
	}

	// is function?
	var func = typeof subject === 'function';

	// extract shape of component
	var shape = func ? (subject(createElement) || createEmptyShape()) : subject;
	
	var construct = false;

	var vnode;
	var constructor;
	var render;

	// numbers, strings, arrays
	if (shape.constructor !== Object && shape.render === void 0) {
		shape = extractVirtualNode(shape, null);
	}

	// elements/functions
	if (shape.nodeType !== void 0 || typeof shape === 'function') {
		// render method
		render = shape.nodeType !== void 0 ? (vnode = shape, function () { return vnode; }) : shape;

		// new shape
		shape = { render: render };
	}
	else {
		// shape has a constructor
		(construct = shape.hasOwnProperty('constructor')) && (constructor = shape.constructor);

		// create render method if one does not exist
		if (typeof shape.render !== 'function') {
			shape.render = function () { return createEmptyShape(); };
		}
	}

	// create component class
	function component (props) {
		// constructor
		construct && constructor.call(this, props);

		// extend Component
		Component.call(this, props); 
	}

	// extends shape
	component.prototype = shape;

	// extends Component class
	shape.setState = Component.prototype.setState;
	shape.forceUpdate = Component.prototype.forceUpdate;
	component.constructor = Component;

	// function shape, cache component
	if (func) {
		shape.constructor = subject;
		subject.COMPCache = component;
	}

	// stylesheet namespaced
	if (func || shape.stylesheet !== void 0) {
		// displayName / function name / random string
		shape.displayName = (
			shape.displayName || 
			(func ? subject.name : false) || 
			((Math.random()+1).toString(36).substr(2, 5))
		);
	}

	return component;
}

