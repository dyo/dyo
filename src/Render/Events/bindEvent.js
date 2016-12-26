/**
 * bind event
 *
 * @param  {string}    name
 * @param  {Object}    value
 * @param  {Component} component
 * @return {function}
 */
function bindEvent (name, value, component) {
	var bind = value.bind;
	var data = value.with;

	var preventDefault = value.preventDefault === void 0 || value.preventDefault === true;

	if (typeof bind === 'object') {
		var property = bind.property || data;

		return function (event) {
			var target = event.currentTarget || event.target;
			var value  = data in target ? target[data] : target.getAttribute(data);

			preventDefault && event.preventDefault();

			// update component state
			component.state[property] = value;

			// update component
			component.forceUpdate();
		}
	} else {
		return function (event) {
			preventDefault && event.preventDefault();
			bind.call(data, data, event);
		}
	}
}

