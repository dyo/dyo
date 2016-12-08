/**
 * bindState
 * 
 * @param  {string}   property
 * @param  {string}   attr
 * @param  {boolean=} preventUpdate
 * @return {function}           
 */
function bindState (property, attr, preventUpdate) {
	var component = this;

	return function (e) {
		var target = e.currentTarget;
		var value  = attr in target ? target[attr] : target.getAttribute(attr);

		component.state[property] = value;

		!preventUpdate && component.forceUpdate();
	}
}

