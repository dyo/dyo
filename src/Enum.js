import * as Utility from './Utility.js'

// static values
export var uid = Utility.symbol()
export var key = -(-1 >>> 0)
export var nan = NaN
export var obj = {}

// dispatch identifiers
export var event = -6
export var props = -5
export var mount = -4
export var unmount = -3
export var content = -2
export var callback = -1

// element identifiers
export var thenable = 1
export var fragment = 2
export var component = 3
export var target = 4
export var portal = 5
export var element = 6
export var text = 7
export var empty = 8

// static identifiers
export var defaultProps = 'defaultProps'
export var displayName = 'displayName'
export var propTypes = 'propTypes'
export var contextTypes = 'contextTypes'

// lifecycles identifiers
export var handleEvent = 'handleEvent'
export var getDerivedState = 'getDerivedState'
export var getChildContext = 'getChildContext'
export var componentDidCatch = 'componentDidCatch'
export var componentDidMount = 'componentDidMount'
export var componentDidUpdate = 'componentDidUpdate'
export var componentWillUnmount = 'componentWillUnmount'
export var shouldComponentUpdate = 'shouldComponentUpdate'
