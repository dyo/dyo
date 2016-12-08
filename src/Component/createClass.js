/**
 * create class
 * 
 * @param  {(Object|function)} subject
 * @return {function}
 */
function createClass (subject) {
	if (subject._component) {
		// cache
		return subject._component; 
	} else {
		var func      = typeof subject === 'function';
		var shape     = func ? subject() : subject;
		var construct = shape.hasOwnProperty('constructor');

		function component (props) {
			construct && this.constructor(props);
			Component.call(this, props); 
		}

		component.prototype             = shape;
		component.prototype.bindState   = Component.prototype.bindState;
		component.prototype.setState    = Component.prototype.setState;
		component.prototype.forceUpdate = Component.prototype.forceUpdate;

		func && (subject._component = component);

		return component.constructor = component;
	}
}

