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
	if (props) {
		// componentWillReceiveProps lifecycle
		this.componentWillReceiveProps && this.componentWillReceiveProps(props); 
		// assign props
		this.props = props;
	} else {
		this.props = this.props || (this.getDefaultProps && this.getDefaultProps()) || {};
	}

	this.state = this.state || (this.getInitialState && this.getInitialState()) || {};
	this.refs = this._vnode = this._cache = null;
}


/**
 * component prototype
 * 
 * @type {Object}
 */
Component.prototype = Object.create(null, {
	setState:    { value: setState },
	forceUpdate: { value: forceUpdate },
	bindState:   { value: bindState }
});

