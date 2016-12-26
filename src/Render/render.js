/**
 * render
 * 
 * @param  {(Component|VNode)} subject
 * @param  {(Node|string)}     target
 * @param  {function(Node)=}   callback
 * @param  {boolean=}          hydration
 * @return {function(Object=)} reconciler
 */
function render (subject, target, callback, hydration) {
	var initial = true;
	var component;	
	var vnode;
	var element;
	
	// renderer
	function reconciler (props) {
		if (initial) {
			// dispatch mount
			appendNode(vnode, element, createNode(vnode, null, null));

			// register mount has been dispatched
			initial = false;

			// assign component instance
			component = vnode.instance;
		} else {
			// update props
			if (props) {
				if (
					component.shouldComponentUpdate !== void 0 && 
					component.shouldComponentUpdate(props, component.state) === false
				) {
					return reconciler;
				}

				component.props = props;
			}

			// update component
			component.forceUpdate(null);
		}

		return reconciler;
	}

	if (subject.render !== void 0) {
		// create component from object
		vnode = VComponent(createClass(subject));
	} else if (subject.type === void 0) {
		// fragment/component
		vnode = subject.constructor === Array ? createElement('@', null, subject) : VComponent(subject);
	} else {
		vnode = subject;
	}

	if (server) {
		return reconciler;
	}

	// dom element
  	if (target != null && target.nodeType != null) {
  		// target is a dom element
  		element = target === document ? docuemnt.body : target;
	} else {
  		// selector
  		target = document.querySelector(target);

  		// default to document.body if no match/document
  		element = (target === null || target === document) ? document.body : target;
	}

	// hydration
	if (hydration === true) {
		// dispatch hydration
		hydrate(element, vnode, 0, nodEmpty, null);

		// register mount has been dispatched
		initial = false;

		// assign component
		component = vnode.instance;
	} else {
		// destructive mount
		hydration === false && (element.textContent = '');
		
		reconciler();
	}

	// if present call root components context, passing root node as argument
	if (callback && typeof callback === 'function') {
		callback.call(component, vnode.DOMNode);
	}

	return reconciler;
}

