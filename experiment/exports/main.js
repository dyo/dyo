if (global.window !== void 0) {
	global.h = element;
}

return {
	version: version,
	h: element,
	createElement: element,
	Component: Component,
	render: render,
	shallow: shallow
}
