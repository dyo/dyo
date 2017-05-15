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
		render,

		ARRAY,
		OBJECT,
		PROPS,

		READY,
		PROCESSING,
		PROCESSED,
		PENDING,

		STRING,
		FUNCTION,
		CLASS,
		NOOP,

		EMPTY,
		TEXT,
		ELEMENT,
		COMPOSITE,
		FRAGMENT,
		ERROR,
		PORTAL
	);
}

return exports;
