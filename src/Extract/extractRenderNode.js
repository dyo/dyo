/**
 * extract render node
 *
 * @param  {Component} component
 * @return {VNode}
 */
function extractRenderNode (component) {
	try {
		// async render
		if (component['--async'] === true) {	
			if (browser) {
				component.props.then(function resolveAsyncClientComponent (props) {
					component.props = props;
					component.forceUpdate();
				}).catch(funcEmpty);
				
				component['--async'] = false;
			}

			return createEmptyShape();
		}
		// generator
		else if (component['--yield'] === true) {
			return extractVirtualNode(
				component.render.next().value, 
				component
			);
		}
		// sync render
		else {
			return extractVirtualNode(
				component.render(component.props, component.state, component), 
				component
			);
		}
	}
	// error thrown
	catch (error) {
		return componentErrorBoundary(error, component, 'render');
	}
}

