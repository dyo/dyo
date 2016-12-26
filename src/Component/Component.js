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
	// initial props
	if (this.getInitialProps) {
		this.props = this.getInitialProps(props);
	}
	// assign props
	else if (props !== objEmpty) {
		this.componentWillReceiveProps && this.componentWillReceiveProps(props);
		this.props = props;
	} 
	// default props
	else {
		this.props = this.props || (this.getDefaultProps && this.getDefaultProps()) || {};
	}

	// assign state
	this.state = this.state || (this.getInitialState && this.getInitialState()) || {};

	// VNode and refs
	this.refs = this.VNode = null;
}


/**
 * component prototype
 * 
 * @type {Object}
 */
Component.prototype = Object.create(null, {
	setState:    { value: setState },
	forceUpdate: { value: forceUpdate }
});

