/**
 * render
 *
 * @public
 * 
 * @param  {(Component|VNode|function|Object<string, any>)} subject
 * @param  {(Node|string)=}                                 target
 * @param  {function(this:Component, Node)=}                callback
 * @param  {boolean=}                                       hydration
 * @return {function(Object=)}
 */
function render (subject, target, callback, hydration) {
	var initial = true;
	var component;	
	var vnode;
	var element;
	
	// renderer
	function renderer (props) {
		if (initial) {
			// dispatch mount
			appendNode(vnode, element, createNode(vnode, null, null));

			// register mount has been dispatched
			initial = false;

			// assign component instance
			component = vnode.instance;
		} else {
			// update props
			if (props !== void 0) {
				if (component.shouldComponentUpdate !== void 0 && 
					component.shouldComponentUpdate(props, component.state) === false
				) {
					return renderer;
				}

				component.props = props;
			}

			// update component
			component.forceUpdate(null);
		}

		return renderer;
	}

	// exit early
	if (server) {
		return renderer;
	}

	// Object
	if (subject.render !== void 0) {
		vnode = VComponent(createClass(subject));
	}
	// array/Component/function
	else if (subject.nodeType === void 0) {
		vnode = subject.constructor === Array ? createElement('@', null, subject) : VComponent(subject);
	} 
	// VElement/VSvg
	else if (subject.nodeType !== 2) {
		vnode = VComponent(createClass({ render: function () { return subject; } }))
	}
	// VComponent
	else {
		vnode = subject;
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
		
		renderer();
	}

	// if present call root components context, passing root node as argument
	if (callback && typeof callback === 'function') {
		callback.call(component, vnode.DOMNode || target);
	}

	return renderer;
}

