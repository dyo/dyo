/**
 * creates a store enhancer
 *
 * @public
 * 
 * @param   {...function} middlewares
 * @return  {function}    a store enhancer
 */
function applyMiddleware () {
	var middlewares = [];
	var length      = arguments.length;

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
				dispatch: composeMiddlewares.apply(null, chain)(store.dispatch), 
				subscribe: store.subscribe,
				connect: store.connect,
				replaceReducer: store.replaceReducer
			};
		}
	}
}

