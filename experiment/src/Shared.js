/**
 * ## Constants
 */
var version = '7.0.0';
var noop = function () {};
var array = [];
var object = {};
var browser = global.window !== void 0;
var document = window.document;
var mount = browser === true ? document.body : null;
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
 * 11: fragment
 *
 * ## Element Type Casts
 *
 * 0: Element
 * 1: Component
 * 2: Function
 */

/**
 * ## Element Shapes
 *
 * name:     node tag             {String}
 * type:     node type            {Function|Class|String}
 * props:    node properties      {Object?}
 * attrs:    node attributes      {Object?}
 * children: node children        {Array<Tree>}
 * key:      node key             {Any}
 * flag:     node flag            {Number}
 * xmlns:    node xmlns namespace {String?}
 * owner:    node component       {Component?}
 * node:     node DOM reference   {Node?}
 * group:    node ground          {Number}
 */

 /**
  * ## Component Shape
  *
  * _sync:       sync/async     {Number}
  * _tree:       current tree   {Tree?}
  * _state:      previous state {Object}
  *
  * props:       current props  {Object}
  * state:       current state  {Object}
  * refs:        refs           {Object?}
  * setState:    method         {Function}
  * forceUpdate: method         {Function}
  */

/**
 * ## Component Flags
 *
 * 0: not pending/blocked(ready) `non of the below`
 * 1: blocked/pending `instance creation | prior merging new state`
 * 2: async/pending `resolving async render`
 */

/**
 * ## Notes
 *
 * `_name` prefix is used to identify function arguments
 * when the value is expected to change within the function
 * and private component properties
 */
