var API = {
	version: version,
	h: element,
	createElement: element,
	Component: Component,
	render: render
};

global.h = element;

if (server === true && typeof require === 'function') {
	require('./dio.server.js')(API, element, shape, extract, attr, object);
}

return API;
