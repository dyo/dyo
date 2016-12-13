/**
 * start animation
 * 
 * @param  {CSSStyleDeclaration} style
 * @param  {Object} animations
 */
function animationWillBegin (style, animations) {
	style.willChange != null && (style.willChange = 'transform, opacity');
	style.transition = animations.transition;

	for (var name in animations) {
		var value = animations[name];

		if (value && name !== 'duration' && name !== 'easing' && name !== 'transition') {
			style[name] = style[name] === value ? '' : value;
		}
	}
}

