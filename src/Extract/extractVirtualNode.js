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
	if (subject.Type !== void 0) {
		return subject;
	}

	// portal
	if (subject.nodeType !== void 0) {	
		return (
			subject = createPortalShape(subject, objEmpty, arrEmpty), 
			subject.Type = 5, 
			subject
		);
	}
	
	switch (subject.constructor) {
		// component
		case Component: {
			return createComponentShape(subject, objEmpty, arrEmpty);
		}
		// booleans
		case Boolean: {
			return createEmptyShape();
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
			// stream
			if (subject.then != null && typeof subject.then === 'function') {
				if (subject['--listening'] !== true) {
					subject.then(function resolveStreamComponent () {
						component.forceUpdate();
					}).catch(funcEmpty);

					subject['--listening'] = true;
				}

				return extractVirtualNode(subject(), component);
			}
			// component
			else if (subject.prototype !== void 0 && subject.prototype.render !== void 0) {
				return createComponentShape(subject, objEmpty, arrEmpty);
			}
			// function
			else {
				return extractVirtualNode(subject((component && component.props) || {}), component);
			}
		}
		// promise
		case Promise: {
			if (browser) {
				subject.then(function resolveAsyncComponent (newNode) {
					replaceRootNode(
						extractVirtualNode(newNode), 
						subject = component['--vnode'], 
						newNode.Type, 
						subject.Type, 
						component
					);
				}).catch(funcEmpty);
			}
			else {
				component['--async'] = subject;
			}

			return createEmptyShape();
		}
	}

	// coroutine
	if (typeof subject.next === 'function' || (subject.prototype != null && subject.prototype.next != null)) {			
		if (subject.return == null) {
			subject = subject(component.props, component.state, component);
		}

		component['--yield'] = true;
		component.render = subject;

		component.constructor.prototype.render = function render () {
			return subject.next().value;
		};

		return extractVirtualNode(subject.next().value, component);
	}
	// component descriptor
	else if (typeof subject.render === 'function') {
		return (
			subject.COMPCache || 
			createComponentShape(subject.COMPCache = createClass(subject, null), objEmpty, arrEmpty)
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

