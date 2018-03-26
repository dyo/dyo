var registry = new WeakMap()

var setNodeDocument = getFactory('setDocument', setDOMDocument)
var setNodeText = getFactory('setText', setDOMText)
var setNodeComment = getFactory('setComment', setDOMComment)
var setNodeProps = getFactory('setProps', setDOMProps)

var getNodeContext = getFactory('getContext', getDOMContext)
var getNodeOwner = getFactory('getOwner', getDOMOwner)
var getNodeDocument = getFactory('getDocument', getDOMDocument)
var getNodeTarget = getFactory('getTarget', getDOMTarget)
var getNodeListener = getFactory('getListener', getDOMListener)
var getNodeType = getFactory('getType', getDOMType)
var getNodePortal = getFactory('getPortal', getDOMPortal)
var getNodeQuery = getFactory('getQuery', getDOMQuery)

var getNodeInitialProps = getFactory('getInitialProps', getDOMInitialProps)
var getNodeUpdatedProps = getFactory('getUpdatedProps', getDOMUpdatedProps)

var isValidNodeTarget = getFactory('isValidTarget', isValidDOMTarget)
var isValidNodeEvent = getFactory('isValidEvent', isValidDOMEvent)
var isValidNodeComponent = getFactory('isValidComponent', isValidDOMComponent)

var willNodeUnmount = getFactory('willUnmount', willDOMUnmount)

var insertNodeChild = getFactory('insertChild', insertDOMChild)
var appendNodeChild = getFactory('appendChild', appendDOMChild)
var removeNodeChild = getFactory('removeChild', removeDOMChild)

var createNodeText = getFactory('createText', createDOMText)
var createNodeEmpty = getFactory('createEmpty', createDOMEmpty)
var createNodeComment = getFactory('createComment', createDOMComment)
var createNodeElement = getFactory('createElement', createDOMElement)
var createNodeComponent = getFactory('createComponent', createDOMComponent)
