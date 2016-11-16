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
		module.exports = factory(global, global.document);
	} else if (typeof define === 'function' && define.amd) {
		define(factory(window, document));
	} else {
		window.dio = factory(window, document);
	}
}(function (window, document) {
	'use strict';
	

	import 'constants.js';
	import 'utilities.js';
	import 'element.js';
	import 'render.js';
	import 'renderToString.js';
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