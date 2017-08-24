var Symbol = window.Symbol || Unique
var WeakMap = window.WeakMap || Hash
var Promise = window.Promise || noop
var Node = window.Node || noop
var UUID = Symbol('dio.UUID')
var Iterator = Symbol.iterator || UUID

var root = new WeakMap()
var document = window.document || noop
var requestAnimationFrame = window.requestAnimationFrame || setTimeout

var ElementPromise = -3
var ElementFragment = -2
var ElementPortal = -1
var ElementIntermediate = 0
var ElementComponent = 1
var ElementNode = 2
var ElementText = 3

var WorkTask = 0
var WorkSync = 1

var LifecycleCallback = 'callback'
var LifecycleRender = 'render'
var LifecycleConstructor = 'constructor'
var LifecycleWillMount = 'componentWillMount'
var LifecycleDidMount = 'componentDidMount'
var LifecycleWillReceiveProps = 'componentWillReceiveProps'
var LifecycleShouldUpdate = 'shouldComponentUpdate'
var LifecycleWillUpdate = 'componentWillUpdate'
var LifecycleDidUpdate = 'componentDidUpdate'
var LifecycleWillUnmount = 'componentWillUnmount'
var LifecycleDidCatch = 'componentDidCatch'
var LifecycleChildContext = 'getChildContext'
var LifecycleInitialState = 'getInitialState'
