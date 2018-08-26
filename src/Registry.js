import * as Utility from './Utility.js'

/**
 * @type {object}
 */
export default new (typeof WeakMap === 'function' ? WeakMap : Utility.extend(function () {
	Utility.define(this, 'id', {value: Utility.symbol('@@registry')})
}, {
	/**
	 * @type {function}
	 * @param {object} key
	 * @return {boolean}
	 */
	has: {
		value: function (key) {
			return Utility.has(key, this.id)
		}
	},
	/**
	 * @type {function}
	 * @param {object} key
	 * @return {any}
	 */
	get: {
		value: function (key) {
			return key[this.id]
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
			return Utility.define(key, this.id, {value: value, configurable: true}), this
		}
	}
}))
