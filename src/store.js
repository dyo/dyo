/**
 * ---------------------------------------------------------------------------------
 * 
 * store
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * creates a store enhancer
 *
 * @param   {...function} middlewares
 * @return  {function} - a store enhancer
 */
function applyMiddleware () {
	var middlewares = [];
	var length = arguments.length;

	// passing arguments to a function i.e [].splice() will prevent this function
	// from getting optimized by the VM, so we manually build the array in-line
	for (var i = 0; i < length; i++) {
		middlewares[i] = arguments[i];
	}

	return function (Store) {
		return function (reducer, initialState, enhancer) {
			// create store
			var store = Store(reducer, initialState, enhancer);
			var api   = {
				getState: store.getState,
				dispatch: store.dispatch
			};

			// create chain
			var chain = [];

			// add middlewares to chain
			for (var i = 0; i < length; i++) {
				chain[i] = middlewares[i](api);
			}

			// return store with composed dispatcher
			return {
				getState: store.getState, 
				dispatch: compose.apply(null, chain)(store.dispatch), 
				subscribe: store.subscribe,
				connect: store.connect,
				replaceReducer: store.replaceReducer
			};
		}
	}
}


/**
 * combines a set of reducers
 * 
 * @param  {Object} reducers
 * @return {function}
 */
function combineReducers (reducers) {
	var keys   = Object.keys(reducers);
	var length = keys.length;

	// create and return a single reducer
	return function (state, action) {
		state = state || {};

		var nextState = {};

		for (var i = 0; i < length; i++) {
			var key = keys[i]; 

			nextState[key] = reducers[key](state[key], action);
		}

		return nextState;
	}
}


/**
 * create store constructor
 * 
 * @param  {function} reducer
 * @param  {*}        initialState
 * @return {Object}   {getState, dispatch, subscribe, connect, replaceReducer}
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
		if (action.type === undefined) {
			throw 'actions without type';
		}

		// update state with return value of reducer
		currentState = reducer(currentState, action);

		// dispatch to all listeners
		for (var i = 0, length = listeners.length; i < length; i++) {
			listeners[i]();
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
		var callback;

		// if component
		if (typeof subject !== 'function' || element !== undefined) {
			// create renderer
			callback = render(VComponent(subject, getState(), []), element);
		} else {
			callback = subject;
		}

		// subscribe to state updates, dispatching render on update
		subscribe(function () {
			callback(getState());
		});
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
		throw 'reducer should be a function';
	}

	// if initialState is a function and enhancer is undefined
	// we assume that initialState is an enhancer
	if (typeof initialState === 'function' && enhancer === undefined) {
		enhancer = initialState;
		initialState = undefined;
	}

	// delegate to enhancer if defined
	if (enhancer !== undefined) {
		// exit early, enhancer is not a function
		if (typeof enhancer !== 'function') {
			throw 'enhancer should be a function';
		}

		return applyMiddleware(enhancer)(Store)(reducer, initialState);
	}

	// if object, multiple reducers, else, single reducer
	return typeof reducer === 'object' ? Store(combineReducers(reducer)) : Store(reducer);
}