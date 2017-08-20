var Readable = require('stream').Readable
var RegExpEscape = /[<>&"']/g

Element.prototype.html = ''
Element.prototype.chunk = ''

Element.prototype.toString = toString
Element.prototype.toStream = toStream
Element.prototype.toJSON = toJSON

exports.renderToString = renderToString
exports.renderToStream = renderToStream
