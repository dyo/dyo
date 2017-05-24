/*
 *  ___ __ __
 * (   (  /  \
 *  ) ) )( () )
 * (___(__\__/
 *
 * a library for building user interfaces
 */
/* eslint-disable */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global, require);
	} else if (typeof define === 'function' && define.amd) {
		define(factory(window, null));
	} else {
		window.dio = factory(window, null);
	}
}(function (self, __require__) {

	'use strict';
