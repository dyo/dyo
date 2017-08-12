(function (global, factory) {
	/* eslint-disable */
	if (typeof exports === 'object' && typeof module !== 'undefined')
		module.exports = factory(global, typeof __webpack_require__ === 'undefined' ? require : global)
	else if (typeof define === 'function' && define.amd)
		define(factory(global, global))
	else
		global.dio = factory(global, global)
}(this, function (window, __require__) {
	/* eslint-disable */
	'use strict'
