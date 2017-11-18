var weakClientMap = new WeakMap()

var setClientHost = createClientFactory('setHost', setDOMHost)
var setClientNode = createClientFactory('setNode', setDOMNode)
var setClientContent = createClientFactory('setContent', setDOMContent)
var setClientText = createClientFactory('setText', setDOMText)
var setClientEvent = createClientFactory('setEvent', setDOMEvent)
var setClientProps = createClientFactory('setProps', setDOMProps)

var getClientHost = createClientFactory('getHost', getDOMHost)
var getClientNode = createClientFactory('getNode', getDOMNode)
var getClientDocument = createClientFactory('getDocument', getDOMDocument)
var getClientTarget = createClientFactory('getTarget', getDOMTarget)
var getClientType = createClientFactory('getType', getDOMType)
var getClientProps = createClientFactory('getProps', getDOMProps)
var getClientPortal = createClientFactory('getPortal', getDOMPortal)
var getClientQuery = createClientFactory('getQuery', getDOMQuery)

var isValidClientHost = createClientFactory('isValidHost', isValidDOMHost)
var isValidClientNode = createClientFactory('isValidNode', isValidDOMNode)
var isValidClientEvent = createClientFactory('isValidEvent', isValidDOMEvent)

var removeClientNode = createClientFactory('removeNode', removeDOMNode)
var insertClientNode = createClientFactory('insertNode', insertDOMNode)
var appendClientNode = createClientFactory('appendNode', appendDOMNode)

var createClientElement = createClientFactory('createElement', createDOMElement)
var createClientText = createClientFactory('createText', createDOMText)
var createClientEmpty = createClientFactory('createEmpty', createDOMEmpty)
