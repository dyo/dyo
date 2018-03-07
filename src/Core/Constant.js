var WeakMap = window.WeakMap || WeakHash
var Symbol = window.Symbol || Math.random
var isArray = Array.isArray
var hasOwnProperty = Object.hasOwnProperty
var defineProperty = Object.defineProperty
var create = Object.create
var requestAnimationFrame = window.requestAnimationFrame || timeout

var SymbolFor = Symbol.for || hash
var SymbolIterator = Symbol.iterator || '@@iterator'
var SymbolAsyncIterator = Symbol.asyncIterator || '@@asyncIterator'
var SymbolElement = SymbolFor('dio.Element')
var SymbolFragment = SymbolFor('dio.Fragment')
var SymbolComponent = SymbolFor('dio.Component')
var SymbolContext = SymbolFor('dio.Context')
var SymbolException = SymbolFor('dio.Exception')

var roots = new WeakMap()
