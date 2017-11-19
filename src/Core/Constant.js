var defineProperty = Object.defineProperty
var defineProperties = Object.defineProperties
var hasOwnProperty = Object.hasOwnProperty
var isArray = Array.isArray

var WeakMap = window.WeakMap || WeakHash
var Symbol = window.Symbol || function (d) { return hash(d) }
var requestAnimationFrame = window.requestAnimationFrame || function (c) { setTimeout(c, 16) }

var SymbolFor = Symbol.for || Symbol
var SymbolIterator = Symbol.iterator || '@@iterator'
var SymbolError = SymbolFor('dio.Error')
var SymbolElement = SymbolFor('dio.Element')
var SymbolFragment = SymbolFor('dio.Fragment')
var SymbolComponent = SymbolFor('dio.Component')
