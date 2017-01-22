/**
 * create scoped stylesheet
 *
 * @param {Component} component
 * @param {function}  constructor
 * @param {Node?}     element
 */
function createScopedStylesheet (component, constructor, element) {
	try {
		// create
		if (component.stylesheet.CSSNamespace === void 0) {
			createScopedCSS(component, constructor.COMPCache || constructor, true)(element);
		}
		// namespace
		else {
			component.stylesheet(element);
		}
	}
	catch (error) {
		componentErrorBoundary(error, component, 'stylesheet');
	}
}

