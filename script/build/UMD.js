// eslint-disable-next-line
var dio = (function (global) {/* eslint-disable */'use strict'

function factory (window, __require__) {
'{%module%}'
}

var temp

/* istanbul ignore next */
if (typeof exports === 'object' && typeof module === 'object' && module !== null) {
	if (typeof __webpack_require__ === 'undefined' && typeof require === 'function') {
		module.exports = factory(global, require)
	} else {
		module.exports = factory(global)
	}
} else if (typeof define === 'function' && define.amd) {
	define(temp = factory(global))
} else {
	temp = global.dio = factory(global)
}

return temp
})(/* istanbul ignore next */typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this))
