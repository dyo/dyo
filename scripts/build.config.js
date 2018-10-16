import pkg from '../package.json'

/**
 * @type {object}
 */
export default [
	{
		/**
		 * @param {object} warning
		 * @param {function} warn
		 */
		onwarn(warning, warn) {
			switch (warning.code) {
				case 'CIRCULAR_DEPENDENCY':
					return
				default:
					warn(warning)
			}
		},
		treeshake: {
			propertyReadSideEffects: false
		},
		context: 'this',
		input: 'index.js',
		output: [
			{
				file: pkg.module,
				freeze: false,
				format: 'es'
			}
		]
	}
]
