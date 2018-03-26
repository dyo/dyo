var WeakMap = window.WeakMap || WeakHash
var Symbol = window.Symbol || Math.random
var isArray = Array.isArray

var objectDefineProperties = Object.defineProperties
var objectDefineProperty = Object.defineProperty
var objectHasOwnProperty = Object.hasOwnProperty
var objectCreate = Object.create
var objectKeys = Object.keys

var SymbolFor = Symbol.for || hash
var SymbolCache = SymbolFor('dio.Cache')
var SymbolState = SymbolFor('dio.State')
var SymbolContext = SymbolFor('dio.Context')
var SymbolElement = SymbolFor('dio.Element')
var SymbolFragment = SymbolFor('dio.Fragment')
var SymbolComponent = SymbolFor('dio.Component')
var SymbolException = SymbolFor('dio.Exception')
var SymbolIterator = Symbol.iterator || '@@iterator'
var SymbolAsyncIterator = Symbol.asyncIterator || '@@asyncIterator'

var uuid = 2147483647
var seed = 4022871197 % uuid
