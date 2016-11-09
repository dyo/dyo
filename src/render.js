/**
 * ---------------------------------------------------------------------------------
 * 
 * render
 * 
 * ---------------------------------------------------------------------------------
 */


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
			if (initial === 1) {
				// dispatch mount
				mount(element, node);
				// register mount dispatched
				initial = 0;
				// assign component
				if (component === undefined) { 
					component = node._owner;
				}
			} else {
				// update props
				if (props !== undefined) {
					if (component.shouldComponentUpdate !== undefined && 
						component.shouldComponentUpdate(props, component.state) === false) {
						return reconciler;
					}

					component.props = props;
				}

				// update component
				component.forceUpdate();
			}

   		return reconciler;
   	}

   	var component, node;

   	if (subject.render !== undefined) {
   		// create component from object
   		node = VComponent(createClass(subject));
   	} else if (subject.type === undefined) {
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

   	// normalize props
   	if (node.props == null || typeof node.props !== 'object') {
   		node.props = {};
   	}

   	// server-side
   	if (document === undefined) {
   		return renderToString(node);
   	}

	// retrieve mount element
	var element = retrieveMount(target);

	// initial mount registry
	var initial = 1;

	// hydration
   	if (element.hasAttribute('hydrate')) {
   		// dispatch hydration
   		hydrate(element, node, 0, emptyVNode);
   		// cleanup element hydrate attributes
   		element.removeAttribute('hydrate');
   		// register mount dispatched
   		initial = 0;

   		// assign component
   		if (component === undefined) { 
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


/**
 * mount render
 * 
 * @param  {Node}   element
 * @param  {Object} newNode
 * @return {number}
 */
function mount (element, newNode) {
	// clear element
	element.textContent = '';
	// create element
	appendNode(newNode, element, createNode(newNode));
}


/**
 * update render
 * 
 * @param  {Node}   element
 * @param  {Object} newNode
 * @param  {Object} oldNode
 */
function update (newNode, oldNode) {
	// detect diffs, pipe diffs to diff handler
	patch(newNode, oldNode);
}


/**
 * retrieve mount element
 * 
 * @param  {*} subject
 * @return {Node}
 */
function retrieveMount (subject) {
	// document not available
	if (document === undefined || (subject != null && subject.nodeType !== undefined)) {
		return subject;
	}

	var target = document.querySelector(subject);

	// default to document.body if no match/document
	return target === null || target === document ? document.body : target;
}