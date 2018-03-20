var registry = new WeakMap()

var setNodeDocument = getFactory('setDocument', setDOMDocument)
var setNodeText = getFactory('setText', setDOMText)
var setNodeComment = getFactory('setComment', setDOMComment)
var setNodeProps = getFactory('setProps', setDOMProps)

var shouldNodeUpdateProps = getFactory('shouldUpdateProps', shouldDOMUpdateProps)

var getNodeContext = getFactory('getContext', getDOMContext)
var getNodeOwner = getFactory('getOwner', getDOMOwner)
var getNodeDocument = getFactory('getDocument', getDOMDocument)
var getNodeTarget = getFactory('getTarget', getDOMTarget)
var getNodeType = getFactory('getType', getDOMType)
var getNodeProps = getFactory('getProps', getDOMProps)
var getNodePortal = getFactory('getPortal', getDOMPortal)
var getNodeQuery = getFactory('getQuery', getDOMQuery)

var isValidNodeTarget = getFactory('isValidTarget', isValidDOMTarget)
var isValidNodeEvent = getFactory('isValidEvent', isValidDOMEvent)
var isValidNodeComponent = getFactory('isValidComponent', isValidDOMComponent)

var removeNodeChild = getFactory('removeChild', removeDOMChild)
var appendNodeChild = getFactory('appendChild', appendDOMChild)
var insertNodeBefore = getFactory('insertBefore', insertDOMBefore)

var createNodeText = getFactory('createTextNode', createDOMText)
var createNodeEmpty = getFactory('createEmptyNode', createDOMEmpty)
var createNodeComment = getFactory('createComment', createDOMComment)
var createNodeElement = getFactory('createElement', createDOMElement)
var createNodeComponent = getFactory('createComponent', createDOMComponent)
