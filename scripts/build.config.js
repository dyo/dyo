import pkg from '../package.json'

/**
 * @param {object} warning
 * @param {function} warn
 */
function onwarn (warning, warn) {
	switch (warning.code) {
		case 'CIRCULAR_DEPENDENCY':
			return
		default:
			warn(warning)
	}
}

/**
 * @type {object}
 */
export default [
	{
		treeshake: {
			propertyReadSideEffects: false
		},
		context: 'this',
		onwarn: onwarn,
		input: 'index.js',
		output: [
			{
				file: pkg.main,
				format: 'cjs',
				freeze: false,
			},
			{
				file: pkg.module,
				freeze: false,
				format: 'es'
			}
		]
	}
]
