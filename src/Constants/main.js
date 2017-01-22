/**
 * ---------------------------------------------------------------------------------
 * 
 * constants
 * 
 * ---------------------------------------------------------------------------------
 */


// current version
var version = '6.0.0';

// enviroment specific variables
var document = window.document || null;
var browser = document !== null;
var Promise = window.Promise;

// namespaces
var nsStyle = 'data-scope';
var nsMath = 'http://www.w3.org/1998/Math/MathML';
var nsXlink = 'http://www.w3.org/1999/xlink';
var nsSvg = 'http://www.w3.org/2000/svg';

// empty shapes
var objEmpty = {};
var arrEmpty = [];
var nodeEmpty = createVNodeShape(0, '', objEmpty, arrEmpty, null, null, null, null, null);
var funcEmpty = function () {};
var fragProps = {style: 'display: inherit;'};

