/**
 * generate error
 *
 * @param {string|Error} error
 * @param {Component}    component
 * @param {string}       location
 * @param {VNode}
 */
function componentErrorBoundary (error, component, location) {
	if (component == null) {
		return createEmptyShape();
	}

	var newNode;
	var oldNode;
	var displayName;
	var authored;
    var func;
	var thrown = component['--throw'];

    if (thrown == null) {
        thrown = 0;
    }

	component['--throw'] = thrown + 1;

	if ((error instanceof Error) === false) {
		error = new Error(error);
	}

	// initial throw from render, try to recover once
	if (thrown === 0 && browser && location === 'render') {
		schedule(function () {
            try {
                // test render for errors
                component.render(component.props, component.state, component);

                // update if no errors where thrown
                component.forceUpdate();
            }
            catch (e) {
                // silently fail to recover
            }
		});
	}

	// second throw, failed to recover the first time
	if (thrown !== 0 && location === 'render') {
		return createEmptyShape();
	}

    func = typeof component === 'function';
	authored = func === false && typeof component.componentDidThrow === 'function';
	displayName = func ? component.name : component.displayName || component.constructor.name;

	// authored error handler
    if (authored) {
        // define error
        Object.defineProperties(error, {
            silence: {value: false, writable: true},
            location: {value: location}, 
            from: {value: displayName}
        });
        
    	try {
    		newNode = component.componentDidThrow(error);
    	}
    	catch (e) {    		
    		// avoid recursive call stack
    		if (thrown >= 0) {
    			// preserve order of errors logged 
    			schedule(function () {
    				component['--throw'] = -1;
    				componentErrorBoundary(e, component, 'componentDidThrow');
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
						'Dio bailed out of rendering an error state for `' + displayName + '`.\n\n'+
						'Reason: `componentDidThrow` returned an invalid element `'+ newNode.type +'`'
					);

    				return createEmptyShape();
    			}

    			newNode.type = newNode.type.replace(/ /g, '');
    		}

    		return newNode || createEmptyShape();
    	}
    	// async replace render node
    	else if (browser && newNode != null && newNode !== true && newNode !== false) {
    		schedule(function () {
    			replaceRootNode(
    				extractVirtualNode(newNode, component), 
    				oldNode = component['--vnode'], 
    				newNode.Type, 
    				oldNode.Type, 
    				component
				)
    		});
    	}
    }

    return createEmptyShape();
}

