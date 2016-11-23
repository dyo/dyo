/**
 * ---------------------------------------------------------------------------------
 * 
 * constants
 * 
 * ---------------------------------------------------------------------------------
 */


var version     = '3.1.0';

var nsstyle     = 'data-scope';
var nsmath      = 'http://www.w3.org/1998/Math/MathML';
var nsxlink     = 'http://www.w3.org/1999/xlink';
var nssvg       = 'http://www.w3.org/2000/svg';

var document    = window.document;
var development = window.global === window && process.env.NODE_ENV === 'development';

var oempty      = Object.create(null);
var vempty      = VNode(0, '', oempty, [], null, null);
var isvoid      = {
	'area':   !0, 'base':  !0, 'br':   !0, '!doctype': !0, 'col':    !0, 'embed':  !0,
	'wbr':    !0, 'track': !0, 'hr':   !0, 'img':      !0, 'input':  !0, 
	'keygen': !0, 'link':  !0, 'meta': !0, 'param':    !0, 'source': !0
};

