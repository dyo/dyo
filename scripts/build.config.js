import pkg from '../package.json'
import {terser} from "rollup-plugin-terser";

const option = {
	onwarn(warning, warn) {
		switch (warning.code) {
			case 'CIRCULAR_DEPENDENCY':
				return
			default:
				warn(warning)
		}
	},
	treeshake: {propertyReadSideEffects: false},
	context: 'this',
	input: 'index.js',
}

/**
 * @type {object}
 */
export default [
	{
		...option,
		output: [{file: pkg.browser, format: 'umd', name: pkg.name, freeze: false, sourcemap: true}],
		plugins: [terser()]
	},
	{
		...option,
		output: [{file: pkg.module, format: 'esm', name: pkg.name, freeze: false, sourcemap: true}],
		plugins: [terser()]
	}
]
