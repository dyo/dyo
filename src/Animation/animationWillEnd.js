/**
 * start animation
 * 
 * @param  {function}  callback
 * @param  {Event}     event
 * @param  {Component} context
 */
function animationWillEnd (style, event, context, callback) {
	style && style.willChange != null && (style.willChange = null);

	if (callback) {
		callback.call(context, event);
	}
}

