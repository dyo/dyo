import pkg from '../package.json'
import {terser} from "rollup-plugin-terser";

const defaults = {
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

const options = {mangle: true, compress: false}

/**
 * @type {object}
 */
export default [
	{
		...defaults,
		output: [{file: pkg.browser, format: 'umd', name: pkg.name, freeze: false, sourcemap: true}],
		plugins: [terser(options)]
	},
	{
		...defaults,
		output: [{file: pkg.module, format: 'esm', name: pkg.name, freeze: false, sourcemap: true}],
		plugins: [terser(options)]
	}
]
