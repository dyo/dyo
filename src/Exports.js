/**
 * Exports
 *
 * @type {Object}
 */
var dio = {
	version: '7.0.0',
	h: element,
	createElement: element,
	render: render,
	Component: Component
};

self.h = element;

/**
 * Server
 */
if (server === true && typeof __require__ === 'function') {
	__require__('./dio.server.js')(
		dio, element, shape, extract, whitelist, render, renderBoundary,
		CHILDREN, PROPS, ATTRS,
		READY, PROCESSING, PROCESSED, PENDING,
		STRING, FUNCTION, CLASS, NOOP,
		EMPTY, TEXT, ELEMENT, COMPOSITE, FRAGMENT, ERROR, PORTAL
	);
}

return dio;
