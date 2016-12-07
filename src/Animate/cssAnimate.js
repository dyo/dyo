/**
 * css transitions/animations
 * 
 * @param  {string}
 * @return {function}
 */
function cssAnimate (type) {			
	return function keyframe (className, operation) {
		// default to addition
		if (operation === void 0) {
			operation = 1;
		}

		var reducer = operation|0 !== 0 ? addClass : removeClass;

		return function (element, callback) {
			// exit early in the absence of an element
			if (element == null || element.nodeType === void 0) {
				callback(element, keyframe);
				return;
			}

			// push to next event-cycle/frame
			setTimeout(function () {
				// add transition class this will start the transtion
				reducer(element, className);

				// exit early no callback,
				if (callback === void 0) {
					return;
				}

				var duration = 0, 
					transition = getComputedStyle(element)[type + 'Duration'];

				// if !(duration property)
				if (transition === void 0) {
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