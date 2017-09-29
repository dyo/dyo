var dio = (function (global) {'use strict'/* eslint-disable */

function factory (window, require, define) {
'{%module%}'
}

var temp

/* istanbul ignore next */
if (typeof exports === 'object' && typeof module !== 'undefined')
	module.exports = factory(global, typeof __webpack_require__ === 'undefined' && require, './node.js')
else if (typeof define === 'function' && define.amd)
	define(temp = factory(global, false, ''))
else
	temp = factory(global, false, '')

return temp
})(/* istanbul ignore next */typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this))
