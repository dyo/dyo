/*!
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * Dio is a fast (~8kb) Virtual DOM framework
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
import 'Element/';
import 'Component/';
import 'Render/';
import 'DOM/';
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
	
	// http
	request:          http(),
	router:           router,
	
	// utilities
	stream:           stream,
	stylis:           stylis,
	escape:           escape,
	panic:            panic,
	sandbox:          sandbox,
	compose:          compose,
	random:           random,
	defer:            defer,

	// version
	version:          version,

	// alias
	h:                createElement,
};


}));