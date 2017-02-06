/**
 * combines a set of reducers
 *
 * @public
 * 
 * @param  {Object<string, function>}  reducers
 * @return {function}
 */
function combineReducers (reducers) {
	var keys = Object.keys(reducers);
	var length = keys.length;

	// return a single reducer which combines all reducers
	return function (state, action) {
		state = state || {};

		var nextState = {};
		var key;

		for (var i = 0; i < length; i++) {			
			nextState[key = keys[i]] = reducers[key](state[key], action);
		}

		return nextState;
	}
}

