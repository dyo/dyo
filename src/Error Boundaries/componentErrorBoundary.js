/**
 * generate error
 *
 * @param {string|Error} error
 * @param {Component}    component
 * @param {string}       location
 * @param {Error}
 */
function componentErrorBoundary (error, component, location) {
	if (component == null) {
		return;
	}

	var newNode;
	var oldNode;
	var displayName;
	var authored;
	var thrown = component.thrown;

	component.thrown = thrown + 1;
	
	if (error instanceof Error === false) {
		error = new Error(error);
	}

	// intial throw from render, retry once
	if (thrown === 0 && browser && location === 'render') {
		setTimeout(call, 0, component.forceUpdate, component, null);
	}
	// multiple render throws / non-render location
	else {		
		authored = typeof component.componentDidThrow === 'function';

		// define error
		Object.defineProperties(error, {
			silence: {value: false, writable: true},
			location: {value: location}, 
			from: {value: (displayName = component.displayName || component.constructor.name)}
		});
		
		// authored error handler
	    if (authored) {
	    	newNode = component.componentDidThrow(error);
	    }

	    if (error.silence !== true) {
	    	// default error handler
	    	console.error(
	          'Dio caught an error thrown by ' + 
	          (displayName ? '`' + displayName + '`' : 'one of your components') + 
	          ', the error was thrown in `' + location + '`.' + 
	          '\n\n' + error.stack.replace(/\n+/, '\n\n')
	        );
	    }

	    if (authored) {
	    	// return render node
	    	if (location === 'render' || location === 'element') {
	    		return newNode;
	    	}
	    	// async replace render node
	    	else if (browser && newNode != null && newNode !== true && newNode !== false) {	 
				setTimeout(
					replaceRootNode, 
					0, 
					extractVirtualNode(newNode), 
					oldNode = component.vnode, 
					newNode.nodeType, 
					oldNode.nodeType, 
					component
				)
	    	}
	    }
	}
}

