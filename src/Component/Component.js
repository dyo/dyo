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
	} else {
		this.props = this.props || (this.getDefaultProps && this.getDefaultProps()) || {};
	}

	// assign state
	this.state = this.state || (this.getInitialState && this.getInitialState()) || {};

	// create refs and node placeholders properties
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

