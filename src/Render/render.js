/**
 * render
 * 
 * @param  {(Component|VNode)} subject
 * @param  {(Node|string)}     target
 * @return {function(Object=)}
 */
function render (subject, target) {
	// renderer
	function reconciler (props) {
		if (initial) {
			// dispatch mount
			mount(element, node);

			// register mount has been dispatched
			initial = false;

			// assign component
			component === void 0 && (component = node._owner);
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

	var component;
	var node;
	var element;

	if (subject.render !== void 0) {
		// create component from object
		node = VComponent(createClass(subject));
	} else if (subject.type === void 0) {
		// fragment/component
		node = subject.constructor === Array ? createElement('@', null, subject) : VComponent(subject);
	} else {
		node = subject;
	}

	if (server) {
		return reconciler;
	}

	// retrieve mount element
  	if (target != null && target.nodeType != null) {
	  // target is a dom element
	  element = target;
	} else {
	  // target might be a selector
	  target = document.querySelector(target);

	  // default to document.body if no match/document
	  element = (target === null || target === document) ? document.body : target;
	}

	// initial mount registry
	var initial = true;

	// hydration
	if (element.hasAttribute('hydrate')) {
		// dispatch hydration
		hydrate(element, node, 0, nodEmpty, null);

		// cleanup element hydrate attributes
		element.removeAttribute('hydrate');

		// register mount has been dispatched
		initial = false;

		// assign component
		component === void 0 && (component = node._owner); 
	} else {
		reconciler();
	}

	return reconciler;
}

