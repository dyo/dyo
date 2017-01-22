/**
 * render to virtual node
 * 
 * @param  {(VNode|function|Component)} subject
 * @param  {Component}                  component
 * @return {VNode}
 */
function extractVirtualNode (subject, component) {
	// empty
	if (subject == null) {
		return createEmptyShape();
	}
	// element
	else if (subject.nodeType !== void 0) {
		return subject;
	}
	else {
		switch (subject.constructor) {
			// component
			case Component: {
				return createComponentShape(subject, null, null);
			}
			// fragment
			case Array: {
				return createElement('@', null, subject);
			}
			// string/number
			case String: case Number: {
				return createTextShape(subject);
			}
			// component/function
			case Function: {
				// component
				if (subject.prototype !== void 0 && subject.prototype.render !== void 0) {
					return createComponentShape(subject, null, null);
				}
				// function
				else {
					return createComponentShape(createClass(subject), null, null);
				}
			}
			// promise
			case Promise: {
				if (browser) {
					subject.then(function resolveAsyncComponent (newNode) {
						replaceRootNode(
							extractVirtualNode(newNode), 
							subject = component.vnode, 
							newNode.nodeType, 
							subject.nodeType, 
							component
						);
					}).catch(funcEmpty);
				}
				else {
					component.async = subject;
				}

				return createEmptyShape();
			}
			default: {
				// coroutine
				if (subject.return != null && typeof subject.next === 'function' && component != null) {
					component.yield = true;
					component.render = subject;

					if (component.constructor.prototype !== void 0) {
						component.constructor.prototype.render = function render () {
							return subject.next().value;
						};
					}

					return extractVirtualNode(subject.next().value, component);
				}
				// component descriptor
				else if (typeof subject.render === 'function') {
					return (
						subject.COMPCache || 
						createComponentShape(subject.COMPCache = createClass(subject), null, null)
					);
				} 
				// unsupported render types, fail gracefully
				else {
					return componentRenderBoundary(
						component,
						'render', 
						subject.constructor.name, 
						''
					) || createEmptyShape();
				}
			}
		}
	}
}

