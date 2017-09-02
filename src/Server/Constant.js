var Readable = require('stream').Readable
var RegExpEscape = /[<>&"']/g
var RegExpDashCase = /([a-zA-Z])(?=[A-Z])/g
var RegExpVendor = /^(ms|webkit|moz)/
var ElementPrototype = Element.prototype

ElementPrototype.html = ''
ElementPrototype.chunk = ''
ElementPrototype.toString = toString
ElementPrototype.toStream = toStream
ElementPrototype.toJSON = toJSON

exports.renderToString = renderToString
exports.renderToStream = renderToStream
