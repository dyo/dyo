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
ContextProvider[SharedSitePrototype] = extend(Component[SharedSitePrototype], {
  getInitialState: function (props) {
    return this[SymbolElement].xmlns = {provider: this, consumers: new List()}
  },
  render: function (props) {
    return props.children
  },
  componentDidUpdate: function (props) {
    !is(this.props.value, props.value) && this.state.consumers.forEach(this.componentChildUpdate)
  },
  componentChildUpdate: function (consumer) {
    consumer.didUpdate = consumer.didUpdate ? false : !!consumer[SharedSiteForceUpdate]()
  }
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
ContextConsumer[SharedSitePrototype] = extend(Component[SharedSitePrototype], {
  getInitialState: function (props) {
    return this[SymbolContext] || {provider: this}
  },
  render: function (props, state) {
    return props.children(state.provider.props.value)
  },
  componentWillReceiveProps: function () {
    this.didUpdate = true
  },
  componentDidMount: function () {
    this.state.consumers && this.state.consumers.insert(this, this.state.consumers)
  },
  componentWillUnmount: function () {
    this.state.consumers && this.state.consumers.remove(this)
  }
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
