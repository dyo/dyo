/*!
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * dio is a fast javascript framework
 * 
 * @licence MIT
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	} else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	} else {
		window.dio = factory(window);
	}
}(function (window) {


	'use strict';


	import 'Constants/';
	import 'Utilities/';
	import 'Stylesheet/';
	import 'Element/';
	import 'Component/';
	import 'Render/';
	import 'SSR/';
	import 'Stream/';
	import 'HTTP/';
	import 'Router/';
	import 'Store/';


	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * exports
	 * 
	 * ---------------------------------------------------------------------------------
	 */


	if (browser) {
		window.h = createElement;
	}

	return {
		// elements
		createElement:    createElement,
		isValidElement:   isValidElement,
		cloneElement:     cloneElement,
		createFactory:    createFactory,
		VText:            VText,
		VElement:         VElement,
		VSvg:             VSvg,
		VFragment:        VFragment,
		VComponent:       VComponent,
		DOM:              DOM,

		// render
		render:           render,
		renderToString:   renderToString,
		renderToStream:   renderToStream,
		renderToCache:    renderToCache,

		// components
		Component:        Component,
		createClass:      createClass,

		// stores
		createStore:      createStore,
		applyMiddleware:  applyMiddleware,
		combineReducers:  combineReducers,
		
		// utilities
		request:          http(),
		router:           router,
		stream:           stream,

		// version
		version:          version,

		// alias
		h:                createElement,
	};
}));