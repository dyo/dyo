/*! DIO 8.0.0 @license MIT */
var dio = (function (global) {'use strict'/* eslint-disable */
function factory (window, require, define) {
'{%module%}'
}

var temp

if (typeof exports === 'object' && typeof module !== 'undefined')
	module.exports = factory(global, typeof __webpack_require__ === 'undefined' && require, './node.js')
/* istanbul ignore next */
else if (typeof define === 'function' && define.amd)
	define(temp = factory(global))
/* istanbul ignore next */
else
	temp = factory(global)

return temp
})(typeof window !== 'undefined' ? window : global)
