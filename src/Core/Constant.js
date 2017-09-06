var Symbol = window.Symbol || function (d) {return 'Symbol('+d+')'}
var WeakMap = window.WeakMap || WeakHash
var Promise = window.Promise || noop

var root = new WeakMap()
var document = window.document || noop
var requestAnimationFrame = window.requestAnimationFrame || function(c) {setTimeout(c, 16)}
var defineProperty = Object.defineProperty
var defineProperties = Object.defineProperties
var hasOwnProperty = Object.hasOwnProperty

var SymbolIterator = Symbol.iterator || Symbol('Iterator')
var SymbolElement = Symbol('Element')
var SymbolComponent = Symbol('Component')
