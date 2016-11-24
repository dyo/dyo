/*!
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * Dio.js is a blazing fast, lightweight (~10kb) feature rich Virtual DOM framework. 
 * https://github.com/thysultan/dio.js
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
	

	import 'constants.js';
	import 'utilities.js';
	import 'element.js';
	import 'render.js';
	import 'renderToString.js';
	import 'renderToStream.js';
	import 'hydrate.js';
	import 'component.js';
	import 'stylesheet.js';
	import 'PropTypes.js';
	import 'stream.js';
	import 'request.js';
	import 'router.js';
	import 'store.js';
	import 'animate.js';
	import 'bootstrap.js';
}));