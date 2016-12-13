/**
 * create animation function
 * 
 * @param  {Component} component
 * @param  {Component} constructor
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

				animationWillBegin(style, animations);
			}

			setTimeout(animationWillEnd, duration, style, event, context, callback);

			return duration;
		};
	};

	animator.animator = true;

	var componentAnimations = component.animation();

	for (var name in componentAnimations) {
		var animations = componentAnimations[name];
			animations.transition = 'all ' + animations.duration + 'ms ' + (animations.easing || '');
	}

	return constructor.prototype.animation = animator;
}

