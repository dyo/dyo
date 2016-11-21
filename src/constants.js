/**
 * ---------------------------------------------------------------------------------
 * 
 * constants
 * 
 * ---------------------------------------------------------------------------------
 */


var version = '3.0.6';

var styleNS = 'data-scope';
var mathNS  = 'http://www.w3.org/1998/Math/MathML';
var xlinkNS = 'http://www.w3.org/1999/xlink';
var svgNS = 'http://www.w3.org/2000/svg';

var document = window.document;
var development = window.global === window && process.env.NODE_ENV === 'development';

var emptyObject = {};
var emptyVNode = {
	nodeType: 0, 
	type: '', 
	props: emptyObject, 
	children: [], 
	_el: null
};

var voidElements = {
	'area':   0, 'base':  0, 'br':   0, '!doctype': 0, 'col':    0, 'embed':  0,
	'wbr':    0, 'track': 0, 'hr':   0, 'img':      0, 'input':  0, 
	'keygen': 0, 'link':  0, 'meta': 0, 'param':    0, 'source': 0
};

