import * as Utility from './Utility.js'

// TODO: new type of element that does not render to screen until required
// This works by employing fragments and letting any crude computations happen within the sandbox
// of a fragment that has not been mounted yet. TODO find better name, etc
export var offscreen = NaN

// stable key
export var key = -(-1 >>> 0)

// element identifier
export var thenable = -5
export var iterable = -4
export var component = -3
export var fragment = -2
export var portal = -1
export var node = 0
export var text = 1
export var empty = 2
export var comment = 3

// from
export var search = 0
export var update = 1
export var create = 2

// active
export var idle = 0
export var active = 1

// component
export var props = 0
export var state = 1
export var force = 2

// interface
export var owner = 0
export var event = 1

// properties
export var prototype = 'prototype'

// lifecycles
export var refs = 'refs'
export var callback = 'callback'

export var constructor = 'constructor'

export var render = 'render'
export var setState = 'setState'
export var forceUpdate = 'forceUpdate'

export var getInitialState = 'getInitialState'
export var getChildContext = 'getChildContext'
export var getDerivedStateFromProps = 'getDerivedStateFromProps'

export var componentDidCatch = 'componentDidCatch'
export var componentDidMount = 'componentDidMount'
export var componentDidUpdate = 'componentDidUpdate'
export var componentWillMount = 'componentWillMount'
export var componentWillUpdate = 'componentWillUpdate'
export var componentWillUnmount = 'componentWillUnmount'
export var componentWillReceiveProps = 'componentWillReceiveProps'
export var shouldComponentUpdate = 'shouldComponentUpdate'

// static properties
export var displayName = 'displayName'
export var defaultProps = 'defaultProps'

// validation types
export var propTypes = 'propTypes'
export var contextTypes = 'contextTypes'

// system symbols
export var iterator = Utility.symbol.iterator || '@@iterator'
export var asyncIterator = Utility.symbol.asyncIterator || '@@asyncIterator'

// library symbols
export var memoize = Utility.symbol.for('@@memoize')
export var element = Utility.symbol.for('@@element')
export var context = Utility.symbol.for('@@context')
export var exception = Utility.symbol.for('@@exception')

// values
export var object = {}
export var array = []
