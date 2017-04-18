/**
 * ## Constants
 */
var version = '7.0.0';
var noop = function () {};
var array = [];
var object = {};
var browser = global.window !== void 0;
var Promise = global.Promise || noop;
var schedule = global.requestIdleCallback || global.requestAnimationFrame || setTimeout;

/**
 * ## Element Flags
 *
 * 1: text
 * 2: element
 * 3: error
 * 4: n/a
 * 5: n/a
 * 6: n/a
 * 7: n/a
 * 8: n/a
 * 9: n/a
 * 10: n/a
 * 11: n/a
 *
 * ## Element Groups
 *
 * 0: Element
 * 1: Function
 * 2: Component
 * 3: Component
 */

/**
 * ## Element Shape
 *
 * name: node tag {String}
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
 * host: node host component(composites) {Component?}
 * async: node work state {Number}
 */

 /**
  * ## Element Async Flag
  *
  * 0: ready(sync)
  * 1: blocked(delegates) `instance creation | prior set state`
  * 2: pending(async) `resolving async render`
  */

/**
 * ## Component Shape
 *
 * _tree: current tree {Tree?}
 * _state: previous state {Object}
 * _async: component async, tracks async lifecycle methods flag {Number}
 *
 * props: current props {Object}
 * state: current state {Object}
 * refs: refs {Object?}
 * setState: method {Function}
 * forceUpdate: method {Function}
 */

/**
 * ## Notes
 *
 * `_name` prefix is used to identify function arguments
 * when the value is expected to change within the function
 * and private component properties.
 *
 * All code that interfaces with the DOM platform is in DOM.js
 * it was structured this way to allow for future work on bridges with other platforms
 * when that becomes possible and overall seperation of concerns.
 */
