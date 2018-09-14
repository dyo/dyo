import * as Enum from './Enum.js'
import * as Utility from './Utility.js'
import * as Registry from './Registry.js'

/**
 * @param {number} id
 * @param {*} value
 * @return {object}
 */
export function factory (id, value) {
	// TODO
	// return {
	// 	Provider: Utility.define(function (props) {
	// 		return props.children
	// 	}, {
	// 		/**
	// 		 * @param {object} props
	// 		 * @return {object?}
	// 		 */
	// 		getDerivedState: {
	// 			value: function (props) {
	// 				if (this.props === props) {
	// 					return (Registry.get(this).xmlns = Utility.assign({}, Registry.get(this).xmlns))[id] = {provider: this, consumers: []}
	// 				}
	// 			}
	// 		},
	// 		/**
	// 		 * @param {object} props
	// 		 * @param {object} state
	// 		 */
	// 		componentDidUpdate: {
	// 			value: function (props, state) {
	// 				if (!Utility.is(this.props.value, props.value)) {
	// 					for (var i = 0, j = state.consumers, k; i < j.length; ++i) {
	// 						try { return !(k = j[i]).active && k.forceUpdate() } finally { k.active = false }
	// 					}
	// 				}
	// 			}
	// 		},
	// 	}),
	// 	Consumer: Utility.define(function (props, state) {
	// 		return props.children(state.provider.props.value || value)
	// 	}, {
	// 		/**
	// 		 * @param {object} props
	// 		 * @return {object?}
	// 		 */
	// 		getDerivedState: {
	// 			value: function (props) {
	// 				if (!(this.active = this.props !== props)) {
	// 					return Registry.get(this).xmlns[id] || {provider: this}
	// 				}
	// 			}
	// 		},
	// 		/**
	// 		 * @param {object} props
	// 		 * @param {object} state
	// 		 */
	// 		componentDidMount: {
	// 			value: function (props, state) {
	// 				state.consumers && state.consumers.push(this)
	// 			}
	// 		}
	// 	})
	// }
}

/**
 * @param {*} value
 * @return {object}
 */
export function create (value) {
	// return factory(Utility.symbol(), value)
}
