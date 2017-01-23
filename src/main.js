/*
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * dio is a javascript framework for building applications.
 * 
 * @licence MIT
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	}
	else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	}
	else {
		window.dio = factory(window);
	}
}(function (window) {


	'use strict';


	import 'Constants/';
	import 'Utilities/';
	import 'Shapes/';
	import 'Stylesheet/';
	import 'Element/';
	import 'Component/';
	import 'Error Boundaries/';
	import 'Extract/';
	import 'Render/';
	import 'Props/';
	import 'Nodes/';
	import 'Events/';
	import 'Refs/';
	import 'Reconciler/';
	import 'Hydrate/';
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
		// version
		version: version,

		// alias
		h: createElement,
		
		// elements
		createElement: createElement,
		isValidElement: isValidElement,
		cloneElement: cloneElement,
		createFactory: createFactory,
		DOM: DOM,

		// render
		render: render,
		shallow: shallow,

		// server
		renderToString: renderToString,
		renderToStream: renderToStream,
		renderToCache: renderToCache,

		// components
		Component: Component,
		createClass: createClass,

		// stores
		createStore: createStore,
		applyMiddleware: applyMiddleware,
		combineReducers: combineReducers,
		
		// utilities
		request: request,
		router: router,
		stream: stream,

		// shapes
		text: createTextShape,
		element: createElementShape,
		svg: createSvgShape,
		fragment: createFragmentShape,
		component: createComponentShape,

		// stylesheet
		stylesheet: stylesheet
	};
}));