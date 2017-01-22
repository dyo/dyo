// server
var server = browser === false && window.window !== window;
var readable = server ? require('stream').Readable : null;

// void elements
var isVoid = {
	'area':   0, 'base':  0, 'br':   0, '!doctype': 0, 'col':    0, 'embed': 0,
	'wbr':    0, 'track': 0, 'hr':   0, 'img':      0, 'input':  0, 
	'keygen': 0, 'link':  0, 'meta': 0, 'param':    0, 'source': 0
};

// unicode characters
var uniCodes = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
	'&': '&amp;'
};

// regular expressions
var regEsc = /[<>&"']/g;
var regStyleCamel = /([a-zA-Z])(?=[A-Z])/g;
var regStyleVendor = /^(ms|webkit|moz)/;

