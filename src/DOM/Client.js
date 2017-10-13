var client = new WeakMap()

var setClientHost = config.setHost || setDOMHost
var setClientNode = config.setNode || setDOMNode
var setClientContent = config.setContent || setDOMContent
var setClientText = config.setText || setDOMValue
var setClientEvent = config.setEvent || setDOMEvent
var setClientProps = config.setProps || setDOMProps

var getClientDocument = config.getDocument || getDOMDocument
var getClientTarget = config.getTarget || getDOMTarget
var getClientHost = config.getHost || getDOMHost
var getClientType = config.getType || getDOMType
var getClientProps = config.getProps || getDOMProps
var getClientNode = config.getNode || getDOMNode
var getClientPortal = config.getPortal || getDOMPortal
var getClientQuery = config.getQuery || getDOMQuery

var isValidClientHost = config.isValidHost || isValidDOMHost
var isValidClientNode = config.isValidNode || isValidDOMNode
var isValidClientEvent = config.isValidEvent || isValidDOMEvent

var removeClientNode = config.removeNode || removeDOMNode
var insertClientNode = config.insertNode || insertDOMNode
var appendClientNode = config.appendNode || appendDOMNode

var createClientElement = config.createElement || createDOMElement
var createClientText = config.createText || createDOMText
var createClientEmpty = config.createEmpty || createDOMEmpty
