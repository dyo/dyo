var Promise = window.Promise || {}
var WeakMap = window.WeakMap || WeakHash
var Symbol = window.Symbol || function (d) { return 'Symbol('+d+')' }
var requestAnimationFrame = window.requestAnimationFrame || function (c) { setTimeout(c, 16) }

var defineProperty = Object.defineProperty
var defineProperties = Object.defineProperties
var hasOwnProperty = Object.hasOwnProperty
var isArray = Array.isArray

var SymbolIterator = Symbol.iterator || '@@iterator'
var SymbolError = Symbol('Error')
var SymbolElement = Symbol('Element')
var SymbolComponent = Symbol('Component')
