/**
 * ---------------------------------------------------------------------------------
 * 
 * exports
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * bootstrap
 * 
 * @param  {Object} api
 * @return {Object} api
 */
function bootstrap (api) {
	// if browser expose h
	if (window.window === window) {
		window.h = createElement;
	}

	return Object.defineProperties(api, {
  		'PropTypes': {
  			// only construct PropTypes when used
  			get: function () {
  				return (
  					Object.defineProperty(
  						this, 'PropTypes', { value: PropTypes() }
						),
  					this.PropTypes
					);
  			},
  			configurable: true, 
  			enumerable: true
    	},
  		'window': {
  			get: function () { 
  				return window; 
  			}, 
  			set: function (value) { 
  				return window = value, document = value.document, value; 
  			},
			},
  		'enviroment': {
  			get: function () { 
  				return development ? 'development' : 'production'; 
  			}, 
  			set: function (value) {
  				development = value === 'development'; 
  			},
			}
		});
}

return bootstrap({
	// elements
	createElement:          createElement,
	isValidElement:         isValidElement,
	cloneElement:           cloneElement,
	createFactory:          createFactory,
	VText:                  VText,
	VElement:               VElement,
	VFragment:              VFragment,
	VSvg:                   VSvg,
	VComponent:             VComponent,
	VBlueprint:             VBlueprint,
	Children:               Children(),
	DOM:                    DOM,

	// render
	render:                 render,
	renderToString:         renderToString,
	renderToStaticMarkup:   renderToString,
	renderToStream:         renderToStream,

	// components
	Component:              Component,
	createClass:            createClass,
	findDOMNode:            findDOMNode,
	unmountComponentAtNode: unmountComponentAtNode,

	// stores
	createStore:            createStore,
	applyMiddleware:        applyMiddleware,
	combineReducers:        combineReducers,

	// animations
	animate:                animate(),
	
	// http
	request:                request(),
	router:                 router,

	// streams
	stream:                 stream,
	input:                  input,

	// utilities
	escape:                 escape,
	panic:                  panic,
	sandbox:                sandbox,
	compose:                compose,
	random:                 random,
	defer:                  defer,
	flatten:                flatten,
	isObject:               isObject,
	isFunction:             isFunction,
	isString:               isString,
	isArray:                isArray,
	isDefined:              isDefined,
	isNumber:               isNumber,
	isArrayLike:            isArrayLike,

	// version
	version:                version,

	// alias
	h:                      createElement,

	// test utilities
	PropTypes:              null,
	window:                 null,
	enviroment:             null
});