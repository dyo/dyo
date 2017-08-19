var Node = window.Node || noop
var Symbol = window.Symbol || noop
var Iterator = Symbol.iterator
var Promise = window.Promise || noop
var Map = window.Map || Hash
var WeakMap = window.WeakMap || Hash

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

var PriorityLow = -2
var PriorityTask = -1
var PriorityHigh = 1

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

var NSMathML = 'http://www.w3.org/1998/Math/MathML'
var NSXlink = 'http://www.w3.org/1999/xlink'
var NSSVG = 'http://www.w3.org/2000/svg'

var TypeFragment = '#Fragment'
var TypeText = '#Text'
