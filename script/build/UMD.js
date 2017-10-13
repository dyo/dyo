;(function (global) {/* eslint-disable */'use strict'
function factory (window, config, require) {
'{%module%}'
}

/* istanbul ignore next */
if (typeof exports === 'object' && typeof module === 'object' && module !== null) {
	if (typeof __webpack_require__ === 'undefined' && typeof require === 'function' && global.global === global && global.process) {
		module.exports = factory(global, false, require)
	} else {
		module.exports = factory(global, false)
	}
} else if (typeof define === 'function' && define.amd) {
	define(factory(global, false))
} else {
	global.dio = factory(global, false)
}
})(/* istanbul ignore next */typeof window === 'object' ? window : (typeof global === 'object' ? global : this));
