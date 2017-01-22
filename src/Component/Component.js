/**
 * Component class
 *
 * @public
 * 
 * @param {Object<string, any>=} props
 */
function Component (props) {
	// initial props
	if (this.getInitialProps !== void 0) {
		props = this.props = (
			componentDataBoundary(
				this, 
				'getInitialProps', 
				(props = (props === objEmpty ? {} : props) || {}) || props)
		);

		this.async = (
			props != null && props.constructor !== Object && typeof props.then === 'function'
		) ? true : false;
	}
	else {
		// assign props
		if (props !== objEmpty) {
			// hydrate default props
			if (this.getDefaultProps !== void 0) {
				assignDefaultProps(componentDataBoundary(this, 'getDefaultProps', props), props);
			}
			
			if (this.componentWillReceiveProps !== void 0) {
				componentPropsBoundary(this, props);
			}

			this.props = props;
		} 
		// default props
		else {
			this.props = (
				this.props || 
				(this.getDefaultProps !== void 0 && componentDataBoundary(this, 'getDefaultProps', null)) || 
				{}
			);
		}

		this.async = false;
	}

	// assign state
	this.state = (
		this.state || 
		(this.getInitialState !== void 0 && componentDataBoundary(this, 'getInitialState', null)) || 
		{}
	);

	this.thrown = 0;
	this.yield = false;
	this.vnode = null;
	this.refs = null;
}


/**
 * Component prototype
 * 
 * @type {Object<string, function>}
 */
Component.prototype = Object.create(null, {
	setState: {value: setState},
	forceUpdate: {value: forceUpdate}
});

