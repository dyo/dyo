/**
 * @constructor
 * @param {Object?} props
 * @param {Object?} context
 */
function ContextProvider (props, context) {
  Component.call(this, props, context)
}
/**
 * @type {Object}
 */
ContextProvider[SharedSitePrototype] = create(Component[SharedSitePrototype], {
  getInitialState: {value: function (props) {
    return this[SymbolElement].xmlns = {provider: this, consumers: new List()}
  }},
  render: {value: function (props) {
    return props.children
  }},
  componentDidUpdate: {value: function (props) {
    !is(this.props.value, props.value) && this.state.consumers.forEach(this.componentChildUpdate)
  }},
  componentChildUpdate: {value: function (consumer) {
    consumer.didUpdate = consumer.didUpdate ? false : !!consumer[SharedSiteForceUpdate]()
  }}
})

/**
 * @constructor
 * @param {Object?} props
 * @param {Object?} context
 */
function ContextConsumer (props, context) {
  Component.call(this, props, context)
}
/**
 * @type {Object}
 */
ContextConsumer[SharedSitePrototype] = create(Component[SharedSitePrototype], {
  getInitialState: {value: function (props) {
    return this[SymbolContext] || {provider: this}
  }},
  render: {value: function (props, state) {
    return props.children(state.provider.props.value)
  }},
  componentWillReceiveProps: {value: function () {
    this.didUpdate = true
  }},
  componentDidMount: {value: function () {
    this.state.consumers && this.state.consumers.insert(this, this.state.consumers)
  }},
  componentWillUnmount: {value: function () {
    this.state.consumers && this.state.consumers.remove(this)
  }}
})

/**
 * @param {object} value
 * @return {object}
 */
function createContextComponent (value) {
  return {
    Provider: function Provider (props) {
      return createElement(ContextProvider, assign({}, value, props))
    },
    Consumer: function Consumer (props) {
      return createElement(ContextConsumer, assign({}, value, props))
    }
  }
}

/**
 * @param {*} value
 * @return {object}
 */
function createContext (value) {
  return createContextComponent({value: value, children: noop})
}
