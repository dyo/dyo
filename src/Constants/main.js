/**
 * ---------------------------------------------------------------------------------
 * 
 * constants
 * 
 * ---------------------------------------------------------------------------------
 */


// current version
var version = '6.0.2';

// enviroment
var document = window.document || null;
var browser = document !== null;

// other
var Promise = window.Promise;
var requestAnimationFrame = window.requestAnimationFrame;
var setImmediate = window.setImmediate;

var promiseSupport = Promise !== void 0;
var requestAnimationFrameSupport = requestAnimationFrame !== void 0;
var setImmediateSupport = setImmediate !== void 0;

// namespaces
var nsStyle = 'data-scope';
var nsMath = 'http://www.w3.org/1998/Math/MathML';
var nsXlink = 'http://www.w3.org/1999/xlink';
var nsSvg = 'http://www.w3.org/2000/svg';

// empty shapes
var objEmpty = {};
var arrEmpty = [];
var nodeEmpty = createNodeShape(0, '', objEmpty, arrEmpty, null, null, null, null, null);
var funcEmpty = function () {};
var fragProps = {style: 'display: inherit;'};

