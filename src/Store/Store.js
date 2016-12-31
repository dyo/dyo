/**
 * create store constructor
 * 
 * @param  {function} reducer
 * @param  {*}        initialState
 * @return {Store}    {getState, dispatch, subscribe, connect, replaceReducer}
 */
function Store (reducer, initialState) {
	var currentState = initialState;
	var listeners    = [];

	// state getter, retrieves the current state
	function getState () {
		return currentState;
	}

	// dispatchs a action
	function dispatch (action) {
		if (action.type === void 0) {
			throw 'actions without type';
		}

		// update state with return value of reducer
		currentState = reducer(currentState, action);

		// dispatch to all listeners
		for (var i = 0, length = listeners.length; i < length; i++) {
			listeners[i](currentState);
		}

		return action;
	}

	// subscribe to a store
	function subscribe (listener) {
		if (typeof listener !== 'function') {
			throw 'listener should be a function';
		}

		// retrieve index position
		var index = listeners.length;

		// append listener
		listeners[index] = listener;

		// return unsubscribe function
		return function unsubscribe () {
			// for each listener
			for (var i = 0, length = listeners.length; i < length; i++) {
				// if currentListener === listener, remove
				if (listeners[i] === listener) {
					listeners.splice(i, 1);
				}
			}
		}
	}

	// replace a reducer
	function replaceReducer (nextReducer) {
		// exit early, reducer is not a function
		if (typeof nextReducer !== 'function') {
			throw 'reducer should be a function';
		}

		// replace reducer
		reducer = nextReducer;

		// dispath initial action
		dispatch({type: '@/STORE'});
	}

	// auto subscribe a component to a store
	function connect (subject, element) {
		var renderer;

		// if component and element 
		if (element) {			
			// create renderer add it as a subscriber and return the renderer
			return subscribe(renderer = render(VComponent(subject, currentState, null), element)), renderer;
		} else {
			return subscribe(subject);
		}
	}

	// dispath initial action
	dispatch({type: '@/STORE'});

	return {
		getState:       getState, 
		dispatch:       dispatch, 
		subscribe:      subscribe,
		connect:        connect,
		replaceReducer: replaceReducer
	};
}

