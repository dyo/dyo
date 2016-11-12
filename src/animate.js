/**
 * ---------------------------------------------------------------------------------
 * 
 * animations
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * animate interface
 * 
 * @return {Object}
 */
function animate () {
	/**
	 * element has class
	 * 
	 * @param  {Node}    element
	 * @param  {string}  className
	 * @return {boolean}
	 */
	function hasClass (element, className) {
		return element.classList !== undefined ? 
			element.classList.contains(className) : 
			element.className.indexOf(className) > -1;
	}


	/**
	 * element add class
	 * 
	 * @param {Node}   element
	 * @param {string} className
	 */
	function addClass (element, className) {
		if (element.classList !== undefined) {
			element.classList.add(className);
		} else if (hasClass(element, className) === true) {
			var classes = element.className.split(' ');
			// add new class, join array, assign
			classes[classes.length] = className; 
			element.className = classes.join(' ');			
		}
	}


	/**
	 * element remove class
	 * 
	 * @param {Node}
	 * @param {string}
	 */
	function removeClass (element, className) {
		if (element.classList !== undefined) {
			element.classList.remove(className);
		} else {
			var classes = element.className.split(' ');
			// remove className on index, join array, assign
			classes.splice(classes.indexOf(className), 1);
			element.className = classes.join(' ');
		}
	}


	/**
	 * element toggle class
	 * 
	 * @param {Node}   element   - target element
	 * @param {string} className - classname to toggle
	 */
	function toggleClass (element, className) {
		if (element.classList !== undefined) {
			element.classList.toggle(className);
		} else {
			hasClass(element, className) === true ? 
						removeClass(element, className) : 
						addClass(element, className);
		}
	}


	/**
	 * assign style prop (un)/prefixed
	 * 
	 * @param {Object} style
	 * @param {string} prop
	 * @param {string} value
	 */
	function prefix (style, prop, value) {
		// if !un-prefixed support
		if (style !== undefined && style[prop] === undefined) {
			// chrome, safari, mozila, ie
			var vendors = ['webkit','Webkit','Moz','ms'];

			for (var i = 0, length = vendors.length; i < length; i++) {
				// vendor + capitalized ---> webkitAnimation
				prefixed = (
					vendors[i] + prop[0].toUpperCase() + prop.substr(1, prop.length)
				);

				// add prop if vendor prop exists
				if (style[prefixed] !== undefined) {
					style[prefixed] = value;
				}
			}
		} else {
			style[prop] = value;
		}
	}


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
	function flip (className, duration, transformations, transformOrigin, easing) {
		return function (element, callback) {
			transformations = transformations || '';

			// get element if selector
			if (typeof element === 'string') {
				element = document.querySelector(element);
			} else if (this.nodeType !== undefined) {
				element = this;
			}

			// check if element exists
			if (element === undefined || element.nodeType === undefined) {
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
			if (element.animate !== undefined && typeof element.animate === 'function') {
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
			if (transformOrigin !== undefined) {
				prefix(style, 'transformOrigin', transformOrigin);
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
				prefix(style, 'transform', transform[0])

				// register repaint
				element.offsetWidth;

				var timeDetails = duration + 'ms ' + easing;
								
				// assign animation timing details
				prefix(
					style, 'transition', 'transform ' + timeDetails + ', ' + 'opacity ' + timeDetails
				);

				// assign last state, animation will playout, calling onfinish when complete
				prefix(style, 'transform', transform[1]);
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
					prefix(style, 'transition', null); 
					prefix(style, 'transform', null);
				}

				// remove event listener
				element.removeEventListener(transEvtEnd, onfinish);
				// clear transform origin styles
				prefix(style, 'transformOrigin', null);

				// clear animation running styles
				removeClass(element, runningClass);
				removeClass(body, runningClass);

				// callback
				if (callback !== undefined && typeof callback === 'function') {
					callback(element);
				}
			}

			return duration;
		}
	}


	/**
	 * css transitions/animations
	 * 
	 * @param  {string}
	 * @return {function}
	 */
	function css (type) {			
		return function keyframe (className, operation) {
			// default to addition
			if (operation === undefined) {
				operation = 1;
			}

			var reducer = operation|0 !== 0 ? addClass : removeClass;

			return function (element, callback) {
				// exit early in the absence of an element
				if (element == null || element.nodeType === undefined) {
					callback(element, keyframe);
					return;
				}

				// push to next event-cycle/frame
				requestAnimationFrame(function () {
					// add transition class this will start the transtion
					reducer(element, className);

					// exit early no callback,
					if (callback === undefined) {
						return;
					}

					var duration = 0, 
						transition = getComputedStyle(element)[type + 'Duration'];

					// if !(duration property)
					if (transition === undefined) {
						callback(element, keyframe);
						return;
					}

					// remove 's' & spaces, '0.4s, 0.2s' ---> '0.4,0.2', split ---> ['0.4','0.2']
					var transitions = (transition.replace(/s| /g, '').split(','));

					// increament duration (in ms)
					for (var i = 0, length = transitions.length; i < length; i++) {
						duration = duration + (1000 * parseFloat(transitions[i]));
					}

					// callback, duration of transition, passing element & keyframe to callback
					setTimeout(callback, duration, element, keyframe);
				});
			}
		}
	}


	return {
		flip:       flip,
		transition: css('transition'),
		animation:  css('animation')
	};
}