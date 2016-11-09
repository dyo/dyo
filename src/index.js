/*!
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * Dio.js is a blazing fast, lightweight (~9kb) feature rich Virtual DOM framework. 
 * https://github.com/thysultan/dio.js
 * 
 * @licence MIT
 */
(function (global, factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	} else if (typeof define === 'function' && define.amd) {
		define(factory(global, global.document));
	} else {
		global.dio = factory(global, global.document);
	}
}(this, function (window, document, undefined) {
	'use strict';

	var version                   = '3.0.0',
		// namespaces
		styleNS                   = 'scope',
		mathNS                    = 'http://www.w3.org/1998/Math/MathML',
		xlinkNS                   = 'http://www.w3.org/1999/xlink',
		svgNS                     = 'http://www.w3.org/2000/svg',
		// functions
		requestAnimationFrame     = window.requestAnimationFrame || setTimeout,
		// other
		development               = window.global === window && process.env.NODE_ENV === 'development',
		emptyObject               = {},
		emptyArray                = [],
		emptyVNode                = {
			nodeType: 0,
			type:     '',
			props:    emptyObject, 
			children: emptyArray, 
			_el:      null
		},
		voidElements              = {
			'area':   0, 'base':  0, 'br':   0, '!doctype': 0, 'col':    0,'embed':  0,
			'wbr':    0, 'track': 0, 'hr':   0, 'img':      0, 'input':  0, 
			'keygen': 0, 'link':  0, 'meta': 0, 'param':    0, 'source': 0
		},
		parseVNodeTypeRegExp;


	require('../src/utilities.js');
	require('../src/element.js');
	require('../src/vdom.js');
	require('../src/hydrate.js');
	require('../src/renderToString.js');
	require('../src/render.js');
	require('../src/component.js');
	require('../src/stylesheet.js');
	require('../src/PropTypes.js');
	require('../src/stream.js');
	require('../src/request.js');
	require('../src/router.js');
	require('../src/store.js');
	require('../src/animate.js');


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
		if (window.window) {
			window.h = createElement;
		}

		return Object.defineProperties(api, {
	  		'PropTypes': {
	  			// only construct PropTypes when used
	  			get: function () {
	  				return (
	  					Object.defineProperty(
	  						this, 
	  						'PropTypes', 
	  						{ value: PropTypes() }
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

		// components
		Component:              createComponent(),
		createClass:            createClass,
		findDOMNode:            findDOMNode,
		unmountComponentAtNode: unmountComponentAtNode,

		// stores
		createStore:            Store,
		applyMiddleware:        applyMiddleware,
		combineReducers:        combineReducers,

		// animations
		animateWith:            animateWith(),

		// http
		request:                request(),
		router:                 router,

		// streams
		stream:                 Stream,
		input:                  input,

		// utilities
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

}));