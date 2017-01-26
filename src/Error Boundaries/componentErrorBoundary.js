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

	if ((error instanceof Error) === false) {
		error = new Error(error);
	}

	// intial throw from render, try to recover once
	if (thrown === 0 && browser && location === 'render') {
		schedule(function () {
			component.forceUpdate(null);
		});
	}

	// second throw, failed to recover the first time
	if (thrown !== 0 && location === 'render') {
		return;
	}

	authored = typeof component.componentDidThrow === 'function';
	displayName = component.displayName || component.constructor.name;

	// define error
	Object.defineProperties(error, {
		silence: {value: false, writable: true},
		location: {value: location}, 
		from: {value: displayName}
	});

	// authored error handler
    if (authored) {
    	try {
    		newNode = component.componentDidThrow(error);
    	}
    	catch (err) {    		
    		// avoid recursive call stack
    		if (thrown >= 0) {
    			// preserve order of errors logged 
    			schedule(function () {
    				component.thrown = -1;
    				componentErrorBoundary(err, component, 'componentDidThrow');
    			});
    		}
    	}
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

    if (authored && location !== 'stylesheet') {	    	
    	// return render node
    	if (location === 'render' || location === 'element') {
    		if (newNode != null && typeof newNode.type === 'string') {
    			if (/^[A-z]/g.exec(newNode.type) === null) {
					console.error(
						'Dio bailed out of rendering an error state.\n\n'+
						'Reason: `componentDidThrow` returned an invalid element `'+ newNode.type +'`'
					);

    				return;
    			}

    			newNode.type = newNode.type.replace(/ /g, '');
    		}

    		return newNode;
    	}
    	// async replace render node
    	else if (browser && newNode != null && newNode !== true && newNode !== false) {
    		schedule(function () {
    			replaceRootNode(
    				extractVirtualNode(newNode), 
    				oldNode = component.vnode, 
    				newNode.Type, 
    				oldNode.Type, 
    				component
				)
    		});
    	}
    }
}

