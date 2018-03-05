var Object = window.Object
var WeakMap = window.WeakMap || WeakHash
var Symbol = window.Symbol || window.Math.random
var isArray = window.Array.isArray
var hasOwnProperty = Object.hasOwnProperty
var defineProperty = Object.defineProperty
var create = Object.create
var requestAnimationFrame = window.requestAnimationFrame || function (c) { setTimeout(c, 16) }

var SymbolFor = Symbol.for || hash
var SymbolIterator = Symbol.iterator || '@@iterator'
var SymbolAsyncIterator = Symbol.asyncIterator || '@@asyncIterator'
var SymbolElement = SymbolFor('dio.Element')
var SymbolFragment = SymbolFor('dio.Fragment')
var SymbolComponent = SymbolFor('dio.Component')
var SymbolContext = SymbolFor('dio.Context')
var SymbolException = SymbolFor('dio.Exception')

var roots = new WeakMap()
