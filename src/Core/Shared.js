var SharedElementPromise = 0
var SharedElementFragment = 1
var SharedElementPortal = 2
var SharedElementSnapshot = 3
var SharedElementComponent = 4
var SharedElementCustom = 5
var SharedElementNode = 6
var SharedElementComment = 7
var SharedElementText = 8
var SharedElementEmpty = 9

var SharedComponentForceUpdate = 0
var SharedComponentPropsUpdate = 1
var SharedComponentStateUpdate = 2

var SharedRefsDispatch = 0
var SharedRefsReplace = 1
var SharedRefsRemove = 2
var SharedRefsAssign = 3

var SharedPropsMount = 0
var SharedPropsUpdate = 1

var SharedMountQuery = 0
var SharedMountOwner = 1

var SharedOwnerAppend = 0
var SharedOwnerInsert = 1

var SharedWorkIdle = 0
var SharedWorkUpdating = 1

var SharedKeyHead = '&|head|'
var SharedKeyBody = '&|body|'
var SharedKeyTail = '&|tail|'

var SharedLocalNameComment = '#comment'
var SharedLocalNameEmpty = '#empty'
var SharedLocalNameText = '#text'

var SharedLinkedPrevious = 'prev'
var SharedLinkedNext = 'next'

var SharedSiteEvent = 'event'
var SharedSitePromise = 'promise'
var SharedSitePrototype = 'prototype'
var SharedSiteCallback = 'callback'
var SharedSiteRender = 'render'
var SharedSiteElement = 'element'
var SharedSiteConstructor = 'constructor'
var SharedSiteForceUpdate = 'forceUpdate'
var SharedSiteSetState = 'setState'
var SharedSiteFindDOMNode = 'findDOMNode'
var SharedSiteDisplayName = 'displayName'

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
var SharedGetDefaultProps = 'getDefaultProps'
var SharedDefaultProps = 'defaultProps'
