/**
 * bind event
 *
 * @param  {string}    name
 * @param  {Object}    value
 * @param  {Object}    cache
 * @param  {Component} component
 * @return {function}
 */
function bindEvent (name, value, cache, component) {
	var bind = value.bind;
	var data = value.with;

	var preventDefault = value.preventDefault === void 0 || value.preventDefault === true;

	if (typeof bind === 'object') {
		var property = bind.property || data;

		return cache[name] = function (e) {
			preventDefault && e.preventDefault();

			var target = e.currentTarget || e.target || this;
			var value  = data in target ? target[data] : target.getAttribute(data);

			// update component state
			component.state[property] = value;

			// update component
			component.forceUpdate();
		}
	} else {
		return cache[name] = function (e) {
			preventDefault && e.preventDefault();
			bind.call(data, data, e);
		}
	}
}