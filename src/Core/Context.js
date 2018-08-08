/**
 * @name ContextProvider
 * @constructor
 * @extends Component
 * @param {object} props
 * @param {object} context
 */
function ContextProvider (props, context) {
	Component.call(this, props, context)
}
ContextProvider[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
	/**
	 * @alias ContextProvider#constructor
	 * @memberof ContextProvider
	 * @type {function}
	 * @this {Component}
	 */
	constructor: {
		value: ContextProvider
	},
	/**
	 * @alias ContextProvider#getInitialState
	 * @memberof ContextProvider
	 * @type {function}
	 * @this {Component}
	 * @param {object} props
	 * @param {object} state
	 * @param {object} context
	 * @return {object}
	 */
	getInitialState: {
		value: function (props, state, context) {
			return this[SymbolForElement].cache = {provider: this, consumers: new List()}
		}
	},
	/**
	 * @alias ContextProvider#render
	 * @memberof ContextProvider
	 * @type {function}
	 * @this {Component}
	 * @param {object} props
	 * @return {any}
	 */
	render: {
		value: function (props) {
			return props.children
		}
	},
	/**
	 * @alias ContextProvider#componentDidUpdate
	 * @memberof ContextProvider
	 * @type {function}
	 * @this {Component}
	 * @param {object} props
	 * @param {object}
	 */
	componentDidUpdate: {
		value: function (props) {
			!is(this.props.value, props.value) && this.state.consumers.forEach(this.componentChildUpdate)
		}
	},
	/**
	 * @alias ContextProvider#componentChildUpdate
	 * @memberof ContextProvider
	 * @type {function}
	 * @param {Component} consumer
	 */
	componentChildUpdate: {
		value: function (consumer) {
			consumer.didUpdate = consumer.didUpdate ? false : !!consumer[SharedSiteForceUpdate]()
		}
	}
})

/**
 * @name ContextConsumer
 * @constructor
 * @extends Component
 * @param {object} props
 * @param {object} context
 */
function ContextConsumer (props, context) {
	Component.call(this, props, context)
}
ContextConsumer[SharedSitePrototype] = ObjectCreate(Component[SharedSitePrototype], {
	/**
	 * @alias ContextConsumer#constructor
	 * @memberof ContextConsumer
	 * @type {function}
	 * @this {Component}
	 */
	constructor: {
		value: ContextConsumer
	},
	/**
	 * @alias ContextConsumer#getInitialState
	 * @memberof ContextConsumer
	 * @type {function}
	 * @this {Component}
	 * @param {object} props
	 * @return {object}
	 */
	getInitialState: {
		value: function (props) {
			return this[SymbolForContext] || {provider: this}
		}
	},
	/**
	 * @alias ContextConsumer#render
	 * @memberof ContextConsumer
	 * @type {function}
	 * @this {Component}
	 * @param {object} props
	 * @param {object} state
	 * @return {any}
	 */
	render: {
		value: function (props, state) {
			return props.children(state.provider.props.value)
		}
	},
	/**
	 * @alias ContextConsumer#componentWillReceiveProps
	 * @memberof ContextConsumer
	 * @type {function}
	 * @this {Component}
	 */
	componentWillReceiveProps: {
		value: function () {
			this.didUpdate = true
		}
	},
	/**
	 * @alias ContextConsumer#componentDidMount
	 * @memberof ContextConsumer
	 * @type {function}
	 * @this {Component}
	 */
	componentDidMount: {
		value: function () {
			this.state.consumers && this.state.consumers.insert(this, this.state.consumers)
		}
	},
	/**
	 * @alias ContextConsumer#componentWillUnmount
	 * @memberof ContextConsumer
	 * @type {function}
	 * @this {Component}
	 */
	componentWillUnmount: {
		value: function () {
			this.state.consumers && this.state.consumers.remove(this)
		}
	}
})

/**
 * @param {any} value
 * @return {{Provider, Consumer}}
 * @public
 */
function createContext (value) {
	var CustomContextProvider, Provider, Consumer

	CustomContextProvider = function (props, context) {
		ContextProvider.call(this, props, context)
	}

	CustomContextProvider[SharedSitePrototype] =
		ObjectCreate(ContextProvider[SharedSitePrototype])

	CustomContextProvider.displayName = 'ContextProvider'

	Provider = createElement(CustomContextProvider, {value: value}),
	Consumer = createElement(ContextConsumer, {value: value, children: noop})

	Object.defineProperty(Provider, SharedPropTypes, {
		get: function () {
			return CustomContextProvider[SharedPropTypes]
		},

		set: function (propTypes) {
			CustomContextProvider[SharedPropTypes] = propTypes
		}
	})

	return {
		/**
		 * @type {Element}
		 */
		Provider: Provider,
		/**
		 * @type {Element}
		 */
		Consumer: Consumer
	}
}
