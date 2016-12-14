/**
 * ---------------------------------------------------------------------------------
 * 
 * component
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * component class
 * 
 * @param {Object=} props
 */
function Component (props) {
	// assign props
	if (props) {
		if (this.componentWillReceiveProps) {
			this.componentWillReceiveProps(props);
		}

		this.props = props;
	} 
	else if (this.props === void 0) {
		this.props = (this.getDefaultProps && this.getDefaultProps()) || {};
	}

	// assign state
	if (this.state === void 0) {
		this.state = (this.getInitialState && this.getInitialState()) || {};
	}

	// create addresses for refs and vnode references
	this.refs = this._vnode = null;
}


/**
 * component prototype
 * 
 * @type {Object}
 */
Component.prototype = Object.create(null, {
	setState:    { value: setState },
	bindState:   { value: bindState },
	forceUpdate: { value: forceUpdate }
});

