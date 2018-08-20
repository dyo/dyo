import * as Utility from './Utility.js'

/**
 * @type {object}
 */
export var descriptors = {
  /**
   * @type {function}
   * @param {object} key
   * @return {boolean}
   */
  has: {
    value: function (key) {
      return this.uuid in key
    }
  },
  /**
   * @type {function}
   * @param {object} key
   * @return {any}
   */
  get: {
    value: function (key) {
      return key[this.uuid]
    }
  },
  /**
   * @type {function}
   * @param {object} key
   * @param {object} value
   * @return {object}
   */
  set: {
    value: function (key, value) {
      return Utility.define(key, this.uuid, {value: value, configurable: true}), this
    }
  }
}

/**
 * @constructor
 */
export var constructor = typeof WeakMap !== 'function' ? WeakMap : Utility.extend(function Registry () {
  Utility.define(this, 'uuid', {value: Utility.symbol('@@registry')})
}, descriptors)

export var instance = new constructor()

/**
 * @param {(object|function)} key
 * @return {boolean}
 */
export function has (key) {
  return instance.has(key)
}

/**
 * @param {(object|function)} key
 * @return {*}
 */
export function get (key) {
  return instance.get(key)
}

/**
 * @param {(object|function)} key
 * @param {*} value
 * @return {*}
 */
export function set (key, value) {
  return instance.set(key, value)
}
