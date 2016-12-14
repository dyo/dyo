/**
 * create animator
 * 
 * @param  {Component}                component
 * @param  {function}                 constructor
 * @return {function(name, callback)} animator
 */
function animation (component, constructor) {
	function animator (name, callback) {
		var animations = componentAnimations[name];
		var context = this;
		var duration = (animations && animations.duration) || 0;

		return function (event) {
			if (animations !== void 0) {
				var style = (event ? (event.currentTarget || event.target || event) : context._vnode._node).style;

				// start animation
				animationWillBegin(style, animations);
			}

			// call callback when animation ends
			setTimeout(animationWillEnd, duration, style, event, context, callback);

			return duration;
		};
	}

	animator.animator = 0;

	// extract animations
	var componentAnimations = component.animation();

	// build transition property
	for (var name in componentAnimations) {
		var animations = componentAnimations[name];
			animations.transition = 'all ' + animations.duration + 'ms ' + (animations.easing || '');
	}

	// return animator and replace animation function
	return constructor.prototype.animation = animator;
}

