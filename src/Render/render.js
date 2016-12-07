/**
 * render
 * 
 * @param  {(function|Object)} subject
 * @param  {Node|string}       target
 * @return {function}
 */
function render (subject, target, callback) {
	// renderer
	function reconciler (props) {
		if (initial) {
			// dispatch mount
			mount(element, node);

			// register mount has been dispatched
			initial = false;

			// assign component
			if (component === null) { 
				component = node._owner;
			}
		} else {
			// update props
			if (props !== void 0) {
				if (
					component.shouldComponentUpdate !== void 0 && 
					component.shouldComponentUpdate(props, component.state) === false
				) {
					return reconciler;
				}

				component.props = props;
			}

			// update component
			component.forceUpdate();
		}

   		return reconciler;
   	}

   	var component = null;
   	var node = null;

   	if (subject.render !== void 0) {
   		// create component from object
   		node = VComponent(createClass(subject));
   	} else if (subject.type === void 0) {
   		// normalization
   		if (subject.constructor === Array) {
			// fragment array
   			node = createElement('@', null, subject);	   			
   		} else {
   			node = VComponent(subject);
   		}
   	} else {
   		node = subject;
   	}

   	if (browser === false) {
   		// server-side
   		return renderToString(node);
   	}

	// retrieve mount element
	var element = retrieveMount(target);

	// initial mount registry
	var initial = true;

	// hydration
   	if (element.hasAttribute('hydrate')) {
   		// dispatch hydration
   		hydrate(element, node, 0, nodeEmpty);

   		// cleanup element hydrate attributes
   		element.removeAttribute('hydrate');

   		// register mount has been dispatched
   		initial = false;

   		// assign component
   		if (component === null) {
   			component = node._owner; 
   		}
   	} else {
   		reconciler();
   	}

   	if (typeof callback === 'function') {
   		callback();
   	}

   	return reconciler;
}

