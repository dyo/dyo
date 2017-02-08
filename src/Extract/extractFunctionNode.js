/**
 * extract function node
 *
 * @param  {function}            type
 * @param  {Object<string, any>} props
 * @return {VNode}
 */
function extractFunctionNode (type, props) {
	try {
		var vnode;
		var func = type['--func'] !== void 0;

		if (func === false) {
			vnode = type(createElement);
		}
		
		if (func || vnode.Type !== void 0) {
			try {
				vnode = type(props);
				
				if (func === false) {
					type['--func'] = true;
				}
			}
			catch (e) {
				vnode = componentErrorBoundary(e, type, 'function');
			}
		}

		return vnode;
	}
	// error thrown
	catch (error) {
		return componentErrorBoundary(error, type, 'function');
	}
}

