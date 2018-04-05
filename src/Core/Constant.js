var WeakMap = window.WeakMap || WeakHash
var Symbol = window.Symbol || Math.random
var ArrayisArray = Array.isArray

var ObjectDefineProperties = Object.defineProperties
var ObjectDefineProperty = Object.defineProperty
var ObjectHasOwnProperty = Object.hasOwnProperty
var ObjectCreate = Object.create
var ObjectKeys = Object.keys

var SymbolFor = Symbol.for || hash
var SymbolForCache = SymbolFor('dio.Cache')
var SymbolForState = SymbolFor('dio.State')
var SymbolForContext = SymbolFor('dio.Context')
var SymbolForElement = SymbolFor('dio.Element')
var SymbolForFragment = SymbolFor('dio.Fragment')
var SymbolForComponent = SymbolFor('dio.Component')
var SymbolForException = SymbolFor('dio.Exception')
var SymbolForIterator = Symbol.iterator || '@@iterator'
var SymbolForAsyncIterator = Symbol.asyncIterator || '@@asyncIterator'
