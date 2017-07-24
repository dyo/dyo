/**
 * Exports
 *
 * @type {Object}
 */
var dio = {
	version: '7.1.0',
	h: element,
	createElement: element,
	render: render,
	Component: Component
};

self.h = element;

/**
 * Server
 */
if (server === true && __require__ !== null) {
	__require__('./dio.server.js')(
		dio, element, shape, extract, whitelist, render, renderBoundary,
		CHILDREN, PROPS, ATTRS,
		READY, PROCESSING, PROCESSED, PENDING,
		STRING, FUNCTION, CLASS, NOOP,
		EMPTY, TEXT, ELEMENT, COMPOSITE, FRAGMENT, ERROR, PORTAL
	);
}

return dio;
