// default stable key
export var key = -(-1 >>> 0)

// default process id
export var pid = 0

// element active status
export var idle = 1
export var active = 2

// element identifiers
export var thenable = 1
export var fragment = 2
export var component = 3
export var portal = 4
export var node = 5
export var text = 6
export var empty = 7
export var comment = 8

// create/update identifiers
export var create = 9
export var search = 10
export var update = 11
export var force = 12
export var state = 13
export var props = 14
export var content = 15
export var mount = 16
export var unmount = 17
export var callback = 18

// methods
export var setState = 'setState'
export var forceUpdate = 'forceUpdate'

// lifecycles
export var event = 'event'
export var render = 'render'
export var getInitialState = 'getInitialState'
export var componentDidCatch = 'componentDidCatch'
export var componentDidMount = 'componentDidMount'
export var componentDidUpdate = 'componentDidUpdate'
export var componentWillMount = 'componentWillMount'
export var componentWillUpdate = 'componentWillUpdate'
export var componentWillUnmount = 'componentWillUnmount'
export var shouldComponentUpdate = 'shouldComponentUpdate'

// static
export var displayName = 'displayName'
export var defaultProps = 'defaultProps'
export var propTypes = 'propTypes'
