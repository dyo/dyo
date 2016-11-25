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

				// register mount has been dispatched
				initial = 0;

				// assign component
				if (component == null) { 
					component = node._owner;
				}
			} else {
				// update props
				if (props !== void 0) {
					if (component.shouldComponentUpdate !== void 0 && 
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

   	var component;
   	var node;

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

   	// server-side
   	if (document === void 0) {
   		return renderToString(node);
   	}

	// retrieve mount element
	var element = retrieveMount(target);

	// initial mount registry
	var initial = 1;

	// hydration
   	if (element.hasAttribute('hydrate')) {
   		// dispatch hydration
   		hydrate(element, node, 0, vempty);

   		// cleanup element hydrate attributes
   		element.removeAttribute('hydrate');

   		// register mount has been dispatched
   		initial = 0;

   		// assign component
   		if (component == null) {
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
 * retrieve mount element
 * 
 * @param  {*} subject
 * @return {Node}
 */
function retrieveMount (subject) {
	// document not available
	if (subject != null && subject.nodeType != null) {
		return subject;
	}

	var target = document.querySelector(subject);

	// default to document.body if no match/document
	return (target === null || target === document) ? document.body : target;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * patch (extraction)
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * extract node
 * 
 * @param  {Object} subject
 * @param  {Object} props
 * @return {Object} 
 */
function extractVNode (subject) {		
	// static node
	if (subject.nodeType !== 2) {
		return subject;
	}

	// possible component class, type
	var candidate;
	var type = subject.type;

	if (type._component !== void 0) {
		// cache
		candidate = type._component;
	} else if (type.constructor === Function && type.prototype.render === void 0) {
		// function components
		candidate = type._component = createClass(type);
	} else {
		// class / createClass components
		candidate = type;
	}

	// create component instance
	var component = subject._owner = new candidate(subject.props);

	if (subject.children.length !== 0) {
		component.props.children = subject.children;
	}
	
	// retrieve vnode
	var vnode = retrieveRender(component);

	// if keyed, assign key to vnode
	if (subject.props.key !== void 0 && vnode.props.key === void 0) {
		vnode.props.key = subject.props.key;
	}

	// if render returns a component
	if (vnode.nodeType === 2) {
		vnode = extractVNode(vnode);
	}

	// assign component node
	component._vnode = VNode(
		vnode.nodeType,
		vnode.type,
		subject.props = vnode.props, 
		subject.children = vnode.children,
		null,
		null
	);

	if (type.stylesheet === void 0) {
		type.stylesheet = component.stylesheet !== void 0 ? component.stylesheet : null;
	}

	return vnode;
}


/**
 * retrieve VNode from render function
 *
 * @param  {Object} subject
 * @return {Object}
 */
function retrieveRender (component) {
	// retrieve vnode
	var vnode = component.render(component.props, component.state, component);

	// if vnode, else fragment
	return vnode.nodeType !== void 0 ? vnode : VFragment(vnode);
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * patch (nodes)
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * patch
 *  
 * @param {Object} newNode  
 * @param {Object} oldNode  
 */
function patch (newNode, oldNode) {
	var newNodeType = newNode.nodeType, oldNodeType = oldNode.nodeType;

	// remove operation
	if (newNodeType === 0) { 
		return 1; 
	}
	// add operation
	else if (oldNodeType === 0) { 
		return 2; 
	}
	// text operation
	else if (newNodeType === 3 && oldNodeType === 3) { 
		if (newNode.children !== oldNode.children) {
			return 3; 
		} 
	}
	// replace operation
	else if (newNode.type !== oldNode.type) {
		return 4;
	}
	// key operation
	else if (newNode.props.key !== oldNode.props.key) {
		return 5; 
	}
	// recursive
	else {		
		// extract node from possible component node
		var currentNode = newNodeType === 2 ? extractVNode(newNode) : newNode;

		// opt1: if currentNode and oldNode are the identical, exit early
		if (currentNode !== oldNode) {			
			// component will update
			if (oldNodeType === 2) {
				var component = oldNode._owner;

				if (
					component.shouldComponentUpdate && 
					component.shouldComponentUpdate(newNode.props, newNode._owner.state) === false
				) {
					return 0;
				}

				if (component.componentWillUpdate) {
					component.componentWillUpdate(newNode.props, newNode._owner.state);
				}
			}

			// opt2: patch props only if oldNode is not a textNode 
			// and the props objects of the two noeds are not equal
			if (currentNode.props !== oldNode.props) {
				patchProps(currentNode, oldNode); 
			}

			// references, children & children length
			var currentChildren = currentNode.children;
			var oldChildren = oldNode.children;
			var newLength = currentChildren.length;
			var oldLength = oldChildren.length;

			// opt3: if new children length is 0 clear/remove all children
			if (newLength === 0) {
				// but only if old children is not already cleared
				if (oldLength !== 0) {
					oldNode._node.textContent = '';
					oldNode.children = currentChildren;
				}	
			}
			// if newNode has children
			// opt4: if currentChildren and oldChildren are identical, exit early
			else {
				// count of index change when we remove items to keep track of the new index to reference
				var deleteCount = 0, parentElement = oldNode._node;

				// for loop, the end point being which ever is the 
				// greater value between newLength and oldLength
				for (var i = 0; i < newLength || i < oldLength; i++) {
					var newChild = currentChildren[i] || vempty;
					var oldChild = oldChildren[i] || vempty;
					var action   = patch(newChild, oldChild);

					// if action dispatched, 
					// ref: 1 - remove, 2 - add, 3 - text update, 4 - replace, 5 - key
					if (action !== 0) {
						// index is always the index 'i' (minus) the deleteCount to get the correct
						// index amidst .splice operations that mutate oldChildren's indexes
						var index = i - deleteCount;

						switch (action) {
							// remove operation
							case 1: {
								var nodeToRemove = oldChildren[index];

								// remove node from the dom
								removeNode(nodeToRemove, parentElement, nodeToRemove._node);
								// normalize old children, remove from array
								splice(oldChildren, index, 1);
								// update delete count, increment
								deleteCount = deleteCount + 1;

								break;
							}
							// add operation
							case 2: {
								addNode(
									index, 
									oldLength, 
									parentElement, 
									createNode(newChild), 
									newChild, 
									oldChild
								);

								// normalize old children, add to array								
								splice(oldChildren, index, 0, newChild);
								// update delete count, decrement
								deleteCount = deleteCount - 1;

								break;
							}
							// text operation
							case 3: {
								// update dom textNode value and oldChild textNode content
								oldChild._node.nodeValue = oldChild.children = newChild.children;

								break;
							}
							// replace operation
							case 4: {
								// replace dom node
								replaceNode(newChild, parentElement, createNode(newChild), oldChild._node);
								// update old children, replace array element
								oldChildren[index] = newChild; 

								break;
							}
							// key operation
							case 5: {
								var fromIndex;
								var newChildKey = newChild.props.key;

								// opt: try to find newChild in oldChildren
								for (var j = 0; j < oldLength; j = j + 1) {
									// found newChild in oldChildren, reference index, exit
									if (oldChildren[j].props.key === newChildKey) {
										fromIndex = j;
										break;
									}
								}

								// opt: if found newChild in oldChildren, only move element
								if (fromIndex !== void 0) {
									// reference element from oldChildren that matches newChild key
									var element = oldChildren[fromIndex];

								    addNode(index, oldLength, parentElement, element._node, element, oldChild);

									// remove element from 'old' oldChildren index
								    splice(oldChildren, fromIndex, 1);
								    // insert into 'new' oldChildren index
								    splice(oldChildren, index, 0, element);

								    // note: the length of oldChildren does not change in this case
								} else {
									// remove node
									if (newLength < oldLength) {
										// reference node to be removed
										var nodeToRemove = oldChildren[index];
										
										// remove node from the dom
										removeNode(nodeToRemove, parentElement, nodeToRemove._node);

										// normalize old children, remove from array
										splice(oldChildren, index, 1);

										// update delete count, increment
										deleteCount = deleteCount + 1;

										// update old children length, decrement
										oldLength = oldLength - 1;
									}
									// add node
									else if (newLength > oldLength) {
										addNode(
											index, 
											oldLength, 
											parentElement, 
											createNode(newChild), 
											newChild, 
											oldChild
										);

										// normalize old children, add to array
										splice(oldChildren, index, 0, newChild);

										// update delete count, decrement
										deleteCount = deleteCount - 1;

										// update old children length, increment
										oldLength = oldLength + 1;
									}
									// replace node
									else {
										// replace dom node
										replaceNode(
											newChild, 
											parentElement, 
											createNode(newChild), 
											oldChild._node
										);

										// update old children, replace array element
										oldChildren[index] = newChild; 
									}
								}

								break;
							}
						}
					}
				}
			}

			// component did update
			if (oldNodeType === 2 && component.componentDidUpdate) {
				component.componentDidUpdate(newNode.props, newNode._owner.state);
			}
		}
	}

	return 0;
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * patch (props)
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * handles diff props
 * 
 * @param  {Object} node
 * @param  {number} index
 * @param  {Object} old
 */
function patchProps (newNode, oldNode) {
	var propsDiff = diffProps(newNode.props, oldNode.props, newNode.props.xmlns || '', []);
	var length    = propsDiff.length;

	// if diff length > 0 apply diff
	if (length !== 0) {
		var target = oldNode._node;

		for (var i = 0; i < length; i++) {
			var prop = propsDiff[i];
			// [0: action, 1: name, 2: value, namespace]
			updateProp(target, prop[0], prop[1], prop[2], prop[3]);
		}

		oldNode.props = newNode.props;
	}
}


/**
 * collect prop diffs
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldProps 
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffProps (newProps, oldProps, namespace, propsDiff) {
	// diff newProps
	for (var newName in newProps) { 
		diffNewProps(newProps, oldProps, newName, namespace, propsDiff); 
	}
	// diff oldProps
	for (var oldName in oldProps) { 
		diffOldProps(newProps, oldName, namespace, propsDiff); 
	}

	return propsDiff;
}


/**
 * diff newProps agains oldProps
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldProps 
 * @param  {string}  newName
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffNewProps (newProps, oldProps, newName, namespace, propsDiff) {
	var newValue = newProps[newName];
	var oldValue = oldProps[newName];

	if (newValue != null && oldValue !== newValue) {
		propsDiff[propsDiff.length] = ['setAttribute', newName, newValue, namespace];
	}
}


/**
 * diff oldProps agains newProps
 * 
 * @param  {Object}  newProps 
 * @param  {Object}  oldName 
 * @param  {string}  namespace
 * @param  {Array[]} propsDiff
 * @return {Array[]}          
 */
function diffOldProps (newProps, oldName, namespace, propsDiff) {
	var newValue = newProps[oldName];

	if (newValue == null) {
		propsDiff[propsDiff.length] = ['removeAttribute', oldName, '', namespace];
	}
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * dom (events)
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * check if a name is an event-like name, i.e onclick, onClick...
 * 
 * @param  {string}  name
 * @param  {*}       value
 * @return {boolean}
 */
function isEventName (name) {
	return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 3;
}


/**
 * extract event name from prop
 * 
 * @param  {string} name
 * @return {string}
 */
function extractEventName (name) {
	return name.substr(2).toLowerCase();
}


/**
 * assign refs
 * 
 * @param {Object} subject
 * @param {Node}   element
 * @param {Object} refs
 */
function assignRefs (element, ref, component) {
	// hoist typeof info
	var type = typeof ref;
	var refs = component.refs === null ? component.refs = {} : component.refs;

	if (type === 'string') {
		// string ref, assign
		refs[ref] = element;
	} else if (type === 'function') {
		// function ref, call with element as arg
		ref(element);
	}
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * dom (nodes)
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * remove element
 *
 * @param  {Object} oldNode
 * @param  {Node}   parent
 * @param  {Node}   prevNode
 */
function removeNode (oldNode, parent, prevNode) {
	// remove node
	parent.removeChild(prevNode);

	if (oldNode._owner && oldNode._owner.componentWillUnmount) {
		oldNode._owner.componentWillUnmount();
	}
}


/**
 * insert element
 *
 * @param  {Object} newNode
 * @param  {Node}   parent
 * @param  {Node}   nextNode
 * @param  {Node=}  beforeNode
 */
function insertNode (newNode, parent, nextNode, beforeNode) {
	if (newNode._owner && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount();
	}

	// insert node
	parent.insertBefore(nextNode, beforeNode);

	if (newNode._owner && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount();
	}
}


/**
 * append element
 *
 * @param  {Object} newNode
 * @param  {Node}   parent
 * @param  {Node}   nextNode
 * @param  {Node=}  beforeNode
 */
function appendNode (newNode, parent, nextNode, beforeNode) {
	if (newNode._owner && newNode._owner.componentWillMount) {
		newNode._owner.componentWillMount();
	}

	// append node
	parent.appendChild(nextNode);
	
	if (newNode._owner && newNode._owner.componentDidMount) {
		newNode._owner.componentDidMount();
	}
}


/**
 * replace element
 *
 * @param  {Object} newNode
 * @param  {Node}   parent 
 * @param  {Node}   prevNode
 * @param  {Node}   nextNode
 */
function replaceNode (newNode, parent, nextNode, prevNode) {
	// replace node
	parent.replaceChild(nextNode, prevNode);
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
		insertNode(newNode, parent, newElement, oldNode._node);
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
			if (namespace != null) {
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

			if (props !== oempty) {
				// diff and update/add/remove props
				assignProps(element, props, 0);
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
					appendNode(newChild, element, createNode(newChild, component, namespace));
					
					// we pass namespace and component so that 
					// 1. if element is svg element we can namespace all its children
					// 2. if nested refs we can propagate them to a parent component
				}
			}

			subject._node = element;
		}

		// refs
		if (props.ref !== void 0 && component !== void 0) {
			assignRefs(element, props.ref, component);
		}

		// check if a stylesheet is attached
		if (subject.type.stylesheet != null) {
			if (subject.type.stylesheet === 0) {
				element.setAttribute(nsstyle, subject.type.id);
			} else {
				// note: since we mutate the .stylesheet property to 0 in stylesheet
				// this will execute exactly once at any given runtime lifecycle
				stylesheet(element, subject.type);
			}
		}

		// cache element reference
		return element;
	}
}


/**
 * ---------------------------------------------------------------------------------
 * 
 * dom (props)
 * 
 * ---------------------------------------------------------------------------------
 */


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
	} else if (onlyEvents !== 1) {
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
		propValue === nssvg || 
		propValue === nsmath
	) {
		return;
	}

	// if xlink:href set, exit, 
	if (name === 'xlink:href') {
		return (target[action + 'NS'](nsxlink, 'href', propValue), void 0);
	}

	var isSVG = 0;
	var propName;

	// normalize class/className references, i.e svg className !== html className
	// uses className instead of class for html elements
	if (namespace === nssvg) {
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
		var propValue = value[propName];

		// if targetAttr object has propName, assign
		if (propName in targetAttr) {
			targetAttr[propName] = propValue;
		}
	}
}

