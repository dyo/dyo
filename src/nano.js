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


	import 'Constants/main';
	import 'Utilities/schedule';
	import 'Shapes/Node/';
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

		// components
		Component: Component,
		createClass: createClass,

		// shapes
		text: createTextShape,
		element: createElementShape,
		svg: createSvgShape,
		fragment: createFragmentShape,
		component: createComponentShape,
		portal: createPortalShape,

		// stylesheet
		stylesheet: stylesheet
	};
}));