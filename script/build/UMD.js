;(function (window, __) {
	'use strict'

	/* eslint-disable */

	function factory (module, exports) {
		'{{%body%}}'
	}

	/* istanbul ignore next */

	if (typeof exports === 'object' && typeof module === 'object')
		module['exports'] = factory(window['process'] && window['process']['exit'] && typeof __ === 'function' && __('{{%file%}}'))
	else if (typeof define === 'function' && define['amd'])
		define(factory())
	else
		window['dio'] = factory()
}(/* istanbul ignore next */typeof window === 'object' && window['window'] === window ?
		window : typeof global === 'object' && global['global'] === global ? global : this,
	/* istanbul ignore next */typeof arguments === 'object' && arguments[1]
));
