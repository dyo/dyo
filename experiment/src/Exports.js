/**
 * Exports
 *
 * @type {Object}
 */
var exports = {
	version: '7.0.0',
	h: element,
	createElement: element,
	render: render,
	Component: Component
};

global.h = element;

/**
 * Server
 */
if (server === true) {
	require('./dio.server.js')(
		exports,
		element,
		shape,
		extract,
		whitelist,

		ARRAY,
		OBJECT,
		PROPS,

		ELEMENT,
		FUNCTION,
		CLASS,

		READY,
		PROCESSING,
		PROCESSED,
		PENDING
	);
}

return exports;
