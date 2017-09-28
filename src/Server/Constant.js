var Readable = require('stream').Readable
var RegExpEscape = /[<>&"']/g
var RegExpDashCase = /([a-zA-Z])(?=[A-Z])/g
var RegExpVendor = /^(ms|webkit|moz)/

Object.defineProperties(Element.prototype, {
	toJSON: {value: toJSON},
	toString: {value: toString},
	toStream: {value: toStream}
})

this.renderToString = renderToString
this.renderToNodeStream = renderToNodeStream
