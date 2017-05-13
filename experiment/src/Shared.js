/**
 * ## Constants
 */
var browser = global.window === global;
var server = browser === false;
var body = null;
var svg = 'http://www.w3.org/2000/svg';
var xlink = 'http://www.w3.org/1999/xlink';
var math = 'http://www.w3.org/1998/Math/MathML';

var noop = function () {};
var Promise = global.Promise || noop;
var requestAnimationFrame = global.requestAnimationFrame || setTimeout;
var requestIdleCallback = global.requestIdleCallback || setTimeout;

var SHARED = new Tree(0);

var ARRAY = [];
var OBJECT = {};
var PROPS = {children: ARRAY};

var READY = 0;
var PROCESSING = 1;
var PROCESSED = 2;
var PENDING = 3;

var ELEMENT = 0;
var FUNCTION = 1;
var CLASS = 2;

/**
 * ## Element Flag
 *
 * 1: text
 * 2: element
 * 3: composite
 * 4: fragment
 * 5: error
 * 6: portal
 *
 * ## Element Group
 *
 * 0: Element
 * 1: Function
 * 2: Class
 *
 * ## Element Shape
 *
 * tag: node tag {String}
 * type: node type {Function|Class|String}
 * props: node properties {Object?}
 * attrs: node attributes {Object?}
 * children: node children {Array<Tree>}
 * key: node key {Any}
 * flag: node flag {Number}
 * xmlns: node xmlns namespace {String?}
 * owner: node component {Component?}
 * node: node DOM reference {Node?}
 * group: node ground {Number}
 * async: node work state {Number} 0: ready, 1:processing, 2:processed, 3: pending
 * yield: coroutine {Function?}
 * host: host component
 *
 * ## Component Shape
 *
 * this: current tree {Tree?}
 * async: component async, tracks async lifecycle methods flag {Number}
 *
 * _props: previous props {Object}
 * _state: previous state {Object}
 * _pending: pending state {Object}
 *
 * props: current props {Object}
 * state: current state {Object}
 * refs: refs {Object?}
 * setState: method {Function}
 * forceUpdate: method {Function}
 */
