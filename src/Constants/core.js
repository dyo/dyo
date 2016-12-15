/**
 * ---------------------------------------------------------------------------------
 * 
 * constants
 * 
 * ---------------------------------------------------------------------------------
 */


// current version
var version         = '4.0.0';

// enviroment variables
var document        = window.document || null;
var browser         = document !== null;
var server          = browser === false;

// namespaces
var nsStyle         = 'data-scope';
var nsMath          = 'http://www.w3.org/1998/Math/MathML';
var nsXlink         = 'http://www.w3.org/1999/xlink';
var nsSvg           = 'http://www.w3.org/2000/svg';

// empty shapes
var objEmpty        = Object.create(null);
var arrEmpty        = [];
var nodEmpty        = VNode(0, '', objEmpty, arrEmpty, null, null, null);

// random characters
var randomChars     = 'JrIFgLKeEuQUPbhBnWZCTXDtRcxwSzaqijOvfpklYdAoMHmsVNGy';
