/**
 * ---------------------------------------------------------------------------------
 * 
 * DOM
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * remove element
 *
 * @param  {VNode} oldNode
 * @param  {Node}  parent
 */
function removeNode (oldNode, parent) {
	// remove node
	parent.removeChild(oldNode._node);

	// remove reference to avoid memory leaks with hoisted VNodes
	oldNode._node = null;

	if (oldNode._owner) {
		if (oldNode._owner.componentWillUnmount) {
			oldNode._owner.componentWillUnmount();
		}

		// remove reference...
		oldNode._owner = null;
	}
}


/**
 * replace element
 *
 * @param  {VNode}  newNode
 * @param  {VNode}  oldNode
 * @param  {Node}   parentNode 
 * @param  {Node}   nextNode
 */
function replaceNode (newNode, oldNode, parentNode, nextNode) {
	// replace node
	parentNode.replaceChild(nextNode, oldNode._node);

	// remove reference to avoid memory leaks with hoisted VNodes
	oldNode._node = null;

	// replace node is also a form of removing the node
	if (oldNode._owner) {
		if (oldNode._owner.componentWillUnmount) {
			oldNode._owner.componentWillUnmount();
		}

		// remove reference...
		oldNode._owner = null;
	}
}


/**
 * insert element
 *
 * @param  {VNode}  newNode
 * @param  {VNode}  newNode
 * @param  {Node}   parentNode
 * @param  {Node}   nextNode
 */
function insertNode (newNode, oldNode, parentNode, nextNode) {
	if (newNode._owner && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount();
	}

	// insert node
	parentNode.insertBefore(nextNode, oldNode._node);

	if (newNode._owner && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount();
	}
}


/**
 * move element
 * 
 * @param  {VNode} oldNode
 * @param  {Node}  parentNode
 * @param  {Node}  nextNode
 */
function moveNode (oldNode, parentNode, nextNode) {
	parentNode.insertBefore(nextNode, oldNode._node);
}


/**
 * append element
 *
 * @param  {VNode} newNode
 * @param  {Node}  parentNode
 * @param  {Node}  nextNode
 */
function appendNode (newNode, parentNode, nextNode) {
	if (newNode._owner && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount();
	}

	// append node
	parentNode.appendChild(nextNode);
	
	if (newNode._owner && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount();
	}
}


/**
 * append/insert node
 * 
 * @param {number} index        
 * @param {number} oldLength    
 * @param {Object} newNode      
 * @param {Node}   parentElement
 * @param {Node}   newElement   
 * @param {Object} oldNode 
 */
function addNode (index, oldLength, parent, newElement, newNode, oldNode) {
	// append/insert
	if (index > (oldLength - 1)) {
		// append node to the dom
		appendNode(newNode, parent, newElement);
	} else {
		// insert node to the dom at an specific position
		insertNode(newNode, oldNode, parent, newElement);
	}
}


/**
 * create element
 * 
 * @param  {Object}  subject
 * @param  {Object=} component
 * @param  {string=} namespace
 * @return {Node}
 */
function createNode (subject, component, namespace) {
	var nodeType = subject.nodeType;
	
	if (nodeType === 3) {
		// textNode
		return subject._node = document.createTextNode(subject.children || '');
	} else {
		// element
		var element;
		var props;

		if (subject._node) {
			// clone, blueprint node/hoisted vnode
			props = subject.props;
			element = subject._node;
		} else {
			// create
			var newNode  = nodeType === 2 ? extractVNode(subject) : subject;
			var type     = newNode.type;
			var children = newNode.children;
			var length   = children.length;

			props = newNode.props;

			// assign namespace
			if (props.xmlns !== void 0) { 
				namespace = props.xmlns; 
			}

			// if namespaced, create namespaced element
			if (namespace !== null) {
				// if undefined, assign svg namespace
				if (props.xmlns === void 0) {
					props.xmlns = namespace;
				}

				element = document.createElementNS(namespace, type);
			} else {
				if (newNode.nodeType === 11) {
					element = document.createDocumentFragment();
				} else {
					element = document.createElement(type);
				}
			}

			if (props !== objEmpty) {
				// diff and update/add/remove props
				assignProps(element, props, false);
			}

			// vnode has component attachment
			if (subject._owner != null) {
				(component = subject._owner)._vnode._node = element;
			}

			if (length !== 0) {
				// create children
				for (var i = 0; i < length; i++) {
					var newChild = children[i];

					// clone vnode of hoisted/pre-rendered node
					if (newChild._node) {
						newChild = children[i] = VNode(
							newChild.nodeType,
							newChild.type,
							newChild.props,
							newChild.children,
							newChild._node.cloneNode(true),
							null
						);
					}

					// append child
					appendNode(newChild, element, createNode(newChild, component || null, namespace || null));
					
					// we pass namespace and component so that 
					// 1. if element is svg element we can namespace all its children
					// 2. if nested refs we can propagate them to a parent component
				}
			}

			subject._node = element;
		}

		// refs
		if (props.ref !== void 0 && component !== null) {
			assignRefs(element, props.ref, component);
		}

		// check if a stylesheet is attached
		if (subject.type.stylesheet != null) {
			if (subject.type.stylesheet === 0) {
				element.setAttribute(nsStyle, subject.type.id);
			} else {
				// note: since we mutate the .stylesheet property to 0 in stylesheet
				// this will execute exactly once for any component constructor
				stylesheet(element, subject.type);
			}
		}

		// cache element reference
		return element;
	}
}


/**
 * assign prop for create element
 * 
 * @param  {Node}   target
 * @param  {Object} props
 * @param  {number} onlyEvents
 */
function assignProps (target, props, onlyEvents) {
	for (var name in props) {
		assignProp(target, name, props, onlyEvents);
	}
}


/**
 * assign prop for create element
 * 
 * @param  {Node}   target
 * @param  {string} name
 * @param  {Object} props
 * @param  {number} onlyEvents
 */
function assignProp (target, name, props, onlyEvents) {
	var propValue = props[name];

	if (isEventName(name)) {
		// add event listener
		target.addEventListener(extractEventName(name), propValue, false);
	} else if (onlyEvents === false) {
		// add attribute
		updateProp(target, 'setAttribute', name, propValue, props.xmlns);
	}
}


/**
 * assign/update/remove prop
 * 
 * @param  {Node}   target
 * @param  {string} action
 * @param  {string} name
 * @param  {*}      propValue
 * @param  {string} namespace
 */
function updateProp (target, action, name, propValue, namespace) {
	// avoid refs, keys, events and xmlns namespaces
	if (name === 'ref' || 
		name === 'key' || 
		isEventName(name) || 
		propValue === nsSvg || 
		propValue === nsMath
	) {
		return;
	}

	// if xlink:href set, exit, 
	if (name === 'xlink:href') {
		return (target[action + 'NS'](nsXlink, 'href', propValue), void 0);
	}

	var isSVG = 0;
	var propName;

	// normalize class/className references, i.e svg className !== html className
	// uses className instead of class for html elements
	if (namespace === nsSvg) {
		isSVG = 1;
		propName = name === 'className' ? 'class' : name;
	} else {
		propName = name === 'class' ? 'className' : name;
	}

	var targetProp = target[propName];
	var isDefinedValue = (propValue != null && propValue !== false) ? 1 : 0;

	// objects, adds property if undefined, else, updates each memeber of attribute object
	if (isDefinedValue === 1 && typeof propValue === 'object') {
		targetProp === void 0 ? target[propName] = propValue : updatePropObject(propValue, targetProp);
	} else {
		if (targetProp !== void 0 && isSVG === 0) {
			target[propName] = propValue;
		} else {
			// remove attributes with false/null/undefined values
			if (isDefinedValue === 0) {
				target['removeAttribute'](propName);
			} else {
				// reduce value to an empty string if true, <tag checked=true> --> <tag checked>
				if (propValue === true) { 
					propValue = ''; 
				}

				target[action](propName, propValue);
			}
		}
	}
}


/**
 * update prop objects, i.e .style
 * 
 * @param  {Object} value
 * @param  {*}      targetAttr
 */
function updatePropObject (value, targetAttr) {
	for (var propName in value) {
		var propValue = value[propName] || null;

		// if targetAttr object has propName, assign
		if (propName in targetAttr) {
			targetAttr[propName] = propValue;
		}
	}
}

