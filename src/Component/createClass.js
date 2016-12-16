/**
 * create class
 * 
 * @param  {(Object|function)} subject
 * @return {function}
 */
function createClass (subject) {
	if (subject._component) {
		return subject._component; 
	} else {
		var func  = typeof subject === 'function';
		var shape = func ? subject() : subject;

		// shape has a constructor method
		var init  = shape.hasOwnProperty('constructor');

		function component (props) {
			// constructor
			if (init) {
				this.constructor(props);
			}

			// extend Component
			Component.call(this, props); 
		}

		// extend Component prototype
		component.prototype             = shape;
		component.prototype.setState    = Component.prototype.setState;
		component.prototype.forceUpdate = Component.prototype.forceUpdate;

		// function component, cache created component
		if (func) {
			subject._component = component;
		}

		return component.constructor = component;
	}
}

