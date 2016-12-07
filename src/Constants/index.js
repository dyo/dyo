/**
 * ---------------------------------------------------------------------------------
 * 
 * constants
 * 
 * ---------------------------------------------------------------------------------
 */


// current version
var version      = '4.0.0';

// enviroment variables
var document     = window.document || null;
var browser      = document !== null;
var server       = browser === false;
var development  = server && process.env.NODE_ENV === 'development';

var readable     = server ? require('stream').Readable : null;

// namespaces
var nsStyle      = 'data-scope';
var nsMath       = 'http://www.w3.org/1998/Math/MathML';
var nsXlink      = 'http://www.w3.org/1999/xlink';
var nsSvg        = 'http://www.w3.org/2000/svg';

// empty shapes
var objEmpty     = Object.create(null);
var arrEmpty     = [];
var nodeEmpty    = VNode(0, '', objEmpty, arrEmpty, null, null);

// void elements
var isVoid       = {
	'area':   0, 'base':  0, 'br':   0, '!doctype': 0, 'col':    0, 'embed': 0,
	'wbr':    0, 'track': 0, 'hr':   0, 'img':      0, 'input':  0, 
	'keygen': 0, 'link':  0, 'meta': 0, 'param':    0, 'source': 0
};

// unicode characters
var uniCodes     = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;'
};

// regular expressions
var regEsc       = /[<>&"']/g;
var regRoute     = /([:*])(\w+)|([\*])/g;

// random characters
var randomChars  = 'JrIFgLKeEuQUPbhBnWZCTXDtRcxwSzaqijOvfpklYdAoMHmsVNGy';

