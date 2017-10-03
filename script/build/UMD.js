// eslint-disable-next-line
var dio = (function (global) {/* eslint-disable */'use strict'

function factory (window, require) {
'{%module%}'
}

var temp

/* istanbul ignore next */
if (typeof exports === 'object' && typeof module !== 'undefined')
	module.exports = temp = factory(global, typeof __webpack_require__ === 'undefined' && require)
else if (typeof define === 'function' && define.amd)
	define(temp = factory(global))
else
	temp = factory(global)

return temp
})(/* istanbul ignore next */typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this))
