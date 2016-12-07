/**
 * FLIP animate element, (First, Last, Invert, Play)
 * 
 * @example h('.card', {onclick: animate('active-state', 400, null, null, 'linear')})
 *
 * @param  {string}   className        end state class
 * @param  {number=}  duration
 * @param  {any[]=}   transformations  additional transforms
 * @param  {string=}  transformOrigin
 * @param  {number=}  easing
 * @return {function}
 */
function flipAnimate (className, duration, transformations, transformOrigin, easing) {
	return function (element, callback) {
		transformations = transformations || '';

		// get element if selector
		if (typeof element === 'string') {
			element = document.querySelector(element);
		} else if (this.nodeType !== void 0) {
			element = this;
		}

		// check if element exists
		if (element === void 0 || element.nodeType === void 0) {
			panic('element not found');
		}

		var first, last, webAnimations,
			transform    = [],
			invert       = {},
			element      = element.currentTarget || element,
			style        = element.style,
			body         = document.body,
			runningClass = 'animation-running',
			transEvtEnd  = 'transitionend';

		// feature detection
		if (element.animate !== void 0 && typeof element.animate === 'function') {
			webAnimations = 1;
		}

		// get the first rect state of the element
		first = element.getBoundingClientRect();
		// assign last state if there is an end class
		if (className) {
			toggleClass(element, className);
		}
		// get last rect state of the element, if no nothing changed, use the first state
		last = className ? element.getBoundingClientRect() : first;

		// invert values
		invert.x  = first.left - last.left,
		invert.y  = first.top  - last.top,
		invert.sx = last.width  !== 0 ? first.width  / last.width  : 1,
		invert.sy = last.height !== 0 ? first.height / last.height : 1,

		// animation details
		duration  = duration || 200,
		easing    = easing || 'cubic-bezier(0,0,0.32,1)',

		// 0% state
		transform[0] = 'translate('+invert.x+'px,'+invert.y+'px) translateZ(0)'+
						' scale('+invert.sx+','+invert.sy+')',

		// if extra transformations
		transform[0] = transform[0] + ' ' + transformations,

		// 100% state
		transform[1] = 'translate(0,0) translateZ(0) scale(1,1) rotate(0) skew(0)';

		// assign transform origin if set
		if (transformOrigin !== void 0) {
			prefixStyle(style, 'transformOrigin', transformOrigin);
		}

		// add animation state to dom
		addClass(element, runningClass);
		addClass(body, runningClass);

		// use native web animations api if present for better performance
		if (webAnimations === 1) {
			var player = element.animate(
				[{transform: transform[0]}, {transform: transform[1]}], 
				{duration: duration, easing: easing}
			);

			player.addEventListener('finish', onfinish, false);
		} else {
			// cleanup listener, transitionEnd
			element.addEventListener(transEvtEnd, onfinish, false);
			// assign first state
			prefixStyle(style, 'transform', transform[0])

			// register repaint
			element.offsetWidth;

			var timeDetails = duration + 'ms ' + easing;
							
			// assign animation timing details
			prefixStyle(
				style, 'transition', 'transform ' + timeDetails + ', ' + 'opacity ' + timeDetails
			);

			// assign last state, animation will playout, calling onfinish when complete
			prefixStyle(style, 'transform', transform[1]);
		}

		// cleanup
		function onfinish (e) {
			if (webAnimations === 1) {
				// name of the event listener to remove when using webAnimations
				transEvtEnd = 'finish';
			} else {
				// bubbled events
				if (e.target !== element) {
					return;
				}
				// clear transition and transform styles
				prefixStyle(style, 'transition', null); 
				prefixStyle(style, 'transform', null);
			}

			// remove event listener
			element.removeEventListener(transEvtEnd, onfinish);
			// clear transform origin styles
			prefixStyle(style, 'transformOrigin', null);

			// clear animation running styles
			removeClass(element, runningClass);
			removeClass(body, runningClass);

			// callback
			if (callback !== void 0 && typeof callback === 'function') {
				callback(element);
			}
		}

		return duration;
	}
}