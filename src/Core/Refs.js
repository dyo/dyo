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
	 * @alias ForwardRef#constructor
	 * @memberof ForwardRef
	 * @type {function}
	 * @this {Component}
	 */
	constructor: {
		value: ForwardRef
	},
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
 * @param {function} children
 * @return {function}
 */
function forwardRef (children) {
	return createElementForward(ForwardRef, children)
}

/**
 * @return {object}
 */
function createRef () {
	return {current: null}
}
