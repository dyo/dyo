/**
 * create scoped stylesheet
 *
 * @param {Component} component
 * @param {function}  constructor
 * @param {Node?}     element
 */
function createScopedStyleSheet (component, constructor, element) {
	// create
	if (component.stylesheet.CSSNamespace === void 0) {
		createScopedCSS(component, constructor.COMPCache || constructor, true)(element);
	}
	// namespace
	else {
		component.stylesheet(element);
	}
}

