/**
 * create store interface
 * 
 * @param  {function}  reducer
 * @param  {*}         initialState
 * @param  {function=} enhancer
 * @return {Object}    {getState, dispatch, subscribe, connect, replaceReducer}
 */
function createStore (reducer, initialState, enhancer) {
	// exit early, reducer is not a function
	if (typeof reducer !== 'function') {
		panic('reducer should be a function');
	}

	// if initialState is a function and enhancer is undefined
	// we assume that initialState is an enhancer
	if (typeof initialState === 'function' && enhancer === void 0) {
		enhancer = initialState;
		initialState = void 0;
	}

	// delegate to enhancer if defined
	if (enhancer !== void 0) {
		// exit early, enhancer is not a function
		if (typeof enhancer !== 'function') {
			panic('enhancer should be a function');
		}

		return applyMiddleware(enhancer)(Store)(reducer, initialState);
	}

	// if object, multiple reducers, else, single reducer
	return typeof reducer === 'object' ? Store(combineReducers(reducer)) : Store(reducer);
}