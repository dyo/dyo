/**
 * bind event
 *
 * @param  {string}              name
 * @param  {Object<string, any>} value
 * @param  {Component}           component
 * @return {function}
 */
function bindEvent (name, value, component) {
	var bind = value.bind || value.handler;
	var data = value.with || value.data;
	var preventDefault = value.preventDefault === true || (!value.options && value.preventDefault === void 0);

	if (typeof bind === 'object') {
		var property = bind.property || data;

		return function (event) {
			var target = event.currentTarget || event.target;
			var value = data in target ? target[data] : target.getAttribute(data);

			preventDefault && event.preventDefault();

			// update component state
			component.state[property] = value;

			// update component
			component.forceUpdate();
		}
	} 
	else {
		return function (event) {
			preventDefault && event.preventDefault();
			bind.call(data, data, event);
		}
	}
}

