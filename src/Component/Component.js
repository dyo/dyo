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
		this.props = this.getInitialProps(props) || {};
	}
	// assign props
	else if (props !== objEmpty) {
		// hydrate default props
		if (this.getDefaultProps !== void 0) {
			assignDefaultProps(this.getDefaultProps(), props);
		}
		
		if (this.componentWillReceiveProps !== void 0) {
			this.componentWillReceiveProps(props);
		}

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
 * Component prototype
 * 
 * @type {Object<string, function>}
 */
Component.prototype = Object.create(null, {
	setState:    { value: setState },
	forceUpdate: { value: forceUpdate }
});

