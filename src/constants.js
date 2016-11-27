/**
 * ---------------------------------------------------------------------------------
 * 
 * constants
 * 
 * ---------------------------------------------------------------------------------
 */


var version     = '3.4.0';

var nsstyle     = 'data-scope';
var nsmath      = 'http://www.w3.org/1998/Math/MathML';
var nsxlink     = 'http://www.w3.org/1999/xlink';
var nssvg       = 'http://www.w3.org/2000/svg';

var document    = window.document;
var server      = window.global === window;
var development = server && process.env.NODE_ENV === 'development';
var readable    = server ? require('stream').Readable : function () {};

var oempty      = Object.create(null);
var vempty      = VNode(0, '', oempty, [], null, null);
var isvoid      = {
	'area':   1, 'base':  1, 'br':   1, '!doctype': 1, 'col':    1, 'embed': 1,
	'wbr':    1, 'track': 1, 'hr':   1, 'img':      1, 'input':  1, 
	'keygen': 1, 'link':  1, 'meta': 1, 'param':    1, 'source': 1
};

var unicodes     = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;'
};

var resc        = /[<>&"']/g;
var rkeyf       = /@(keyframes +.*?}$)/g;
var rtrans      = /(transform:.*?;)/g;
var rspaces     = /  +/g;
var ranim       = /(,|:) +/g;

