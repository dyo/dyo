/**
 * @name ForwardRef
 * @constructor
 * @extends Component
 * @param {object} props
 * @param {object} context
 */
function ForwardRef (props, context) {
	Component.call(this, props, context)
}
ForwardRef[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
	/**
	 * @alias ForwardRef#render
	 * @memberof ForwardRef
	 * @type {function}
	 * @param {object} props
	 * @return {Element}
	 */
	render: {
		value: function (props) {
			return this[SymbolForElement].xmlns(props, props.ref)
		}
	}
})

/**
 * @param {Element} element
 * @param {function} xmlns
 * @return {Element}
 */
function disableRef (element, xmlns) {
	return merge(element, {xmlns: xmlns})
}

/**
 * @param {function} children
 * @return {function}
 */
function forwardRef (children) {
	return disableRef(createElement(ForwardRef), children)
}

/**
 * @return {object}
 */
function createRef () {
	return {current: null}
}
