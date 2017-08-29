var Symbol = window.Symbol || function (d) {return 'Symbol('+d+')'}
var WeakMap = window.WeakMap || Hash
var Promise = window.Promise || noop
var Node = window.Node || noop

var SymbolIterator = Symbol.iterator || Symbol('Iterator')
var SymbolElement = Symbol('Element')
var SymbolComponent = Symbol('Component')

var root = new WeakMap()
var document = window.document || noop
var requestAnimationFrame = window.requestAnimationFrame || function(c) {setTimeout(c, 16)}
var defineProperty = Object.defineProperty
var defineProperties = Object.defineProperties

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
var LifecycleAsync = 'async'
var LifecycleState = 'setState'
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
