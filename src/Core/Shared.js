var SharedElementPromise = -3
var SharedElementFragment = -2
var SharedElementPortal = -1
var SharedElementIntermediate = 0
var SharedElementComponent = 1
var SharedElementNode = 2
var SharedElementText = 3
var SharedElementEmpty = 4

var SharedRefsRemove = -1
var SharedRefsAssign = 0
var SharedRefsDispatch = 1
var SharedRefsReplace = 2

var SharedComponentForceUpdate = 0
var SharedComponentPropsUpdate = 1
var SharedComponentStateUpdate = 2

var SharedMountQuery = 0
var SharedMountCommit = 1
var SharedMountRemove = 2
var SharedMountAppend = 3
var SharedMountInsert = 4

var SharedWorkMounting = 1
var SharedWorkIdle = 2
var SharedWorkIntermediate = 3
var SharedWorkProcessing = 4
var SharedWorkPending = 5

var SharedErrorCatch = 1
var SharedErrorThrow = 2

var SharedPropsMount = 1
var SharedPropsUpdate = 2

var SharedLinkedPrevious = 'prev'
var SharedLinkedNext = 'next'

var SharedSitePromise = 'async'
var SharedSitePrototype = 'prototype'
var SharedSiteCallback = 'callback'
var SharedSiteRender = 'render'
var SharedSiteElement = 'element'
var SharedSiteConstructor = 'constructor'
var SharedSiteForceUpdate = 'forceUpdate'
var SharedSiteSetState = 'setState'
var SharedSiteFindDOMNode = 'findDOMNode'
var SharedSiteDisplayName = 'displayName'

var SharedKeyHead = '&|head'
var SharedKeyBody = '&|'
var SharedKeyTail = '&|tail'

var SharedLocalNameEmpty = '#empty'
var SharedLocalNameText = '#text'

var SharedComponentWillMount = 'componentWillMount'
var SharedComponentDidMount = 'componentDidMount'
var SharedComponentWillReceiveProps = 'componentWillReceiveProps'
var SharedComponentShouldUpdate = 'shouldComponentUpdate'
var SharedComponentWillUpdate = 'componentWillUpdate'
var SharedComponentDidUpdate = 'componentDidUpdate'
var SharedComponentWillUnmount = 'componentWillUnmount'
var SharedComponentDidCatch = 'componentDidCatch'
var SharedGetChildContext = 'getChildContext'
var SharedGetInitialState = 'getInitialState'
