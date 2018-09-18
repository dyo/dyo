// default stack identifier
export var stack = 1

// static stable/unstable keys
export var key = -(-1 >>> 0)
export var nan = NaN

// commit identifiers
export var force = -7
export var props = -6
export var mount = -5
export var unmount = -4
export var content = -3
export var children = -2
export var callback = -1

// element properties
export var active = 0
export var host = 1
export var parent = 2
export var owner = 3
export var namespace = 4
export var ref = 5
export var state = 6

// element types
export var thenable = 10
export var fragment = 11
export var component = 12
export var portal = 13
export var node = 14
export var text = 15
export var empty = 16
export var comment = 17

// opaque identifiers
export var search = 20
export var create = 21
export var update = 22

// static identifiers
export var displayName = 'displayName'
export var defaultProps = 'defaultProps'
export var propTypes = 'propTypes'

// lifecycles identifiers
export var getDerivedState = 'getDerivedState'
export var componentDidCatch = 'componentDidCatch'
export var componentDidMount = 'componentDidMount'
export var componentDidUpdate = 'componentDidUpdate'
export var componentWillUnmount = 'componentWillUnmount'
export var shouldComponentUpdate = 'shouldComponentUpdate'
