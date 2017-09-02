var ElementPromise = -3
var ElementFragment = -2
var ElementPortal = -1
var ElementIntermediate = 0
var ElementVoid = 0
var ElementComponent = 1
var ElementNode = 2
var ElementText = 3

var ComponentForce = 0
var ComponentReconcile = 1
var ComponentUpdate = 2

var WorkTask = 0
var WorkSync = 1

var ModePull = 0
var ModePush = 1

var MountRemove = 0
var MountAppend = 1
var MountInsert = 2
var MountReplace = 3

var RefRemove = -1
var RefAssign = 0
var RefDispatch = 1
var RefReplace = 2

var PropsAppend = 1
var PropsReplace = 2

var ErrorPassive = 0
var ErrorActive = 1

var LifecycleCallback = 'callback'
var LifecycleRender = 'render'
var LifecycleConstructor = 'constructor'
var LifecycleAsync = 'async'
var LifecycleSetState = 'setState'
var LifecycleFindDOMNode = 'findDOMNode'
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
