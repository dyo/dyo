var setDOMNode = (this && this.setNode) || noop
var setDOMContent = (this && this.setContent) || noop
var setDOMValue = (this && this.setValue) || noop
var setDOMEvent = (this && this.setEvent) || noop
var setDOMProperties = (this && this.setProperty) || noop

var getDOMDocument = (this && this.getDocument) || noop
var getDOMTarget = (this && this.getTarget) || noop
var getDOMNode = (this && this.getNode) || noop
var getDOMType = (this && this.getType) || noop
var getDOMProps = (this && this.getProps) || noop
var getDOMPortal = (this && this.getPortal) || noop
var getDOMQuery = (this && this.getQuery) || noop

var isValidDOMNode = (this && this.isValidNode) || noop
var isValidDOMEvent = (this && this.isValidEvent) || noop

var removeDOMNode = (this && this.removeNode) || noop
var insertDOMNode = (this && this.insertNode) || noop
var appendDOMNode = (this && this.appendNode) || noop

var createDOMElement = (this && this.createElement) || noop
var createDOMText = (this && this.createText) || noop
var createDOMEmpty = (this && this.createEmpty) || noop
