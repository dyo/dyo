import {terser} from "rollup-plugin-terser"

const options = {mangle: true, compress: false}
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
	context: 'this'
}

export default ({configDir}) => {
	return [
		{
			...defaults,
			input: `${configDir}/index.js`,
			output: [{file: `${configDir}/dist/dyo.umd.js`, format: 'umd', name: 'dyo', freeze: false, sourcemap: true}],
			plugins: [terser(options)]
		},
		{
			...defaults,
			input: `${configDir}/index.js`,
			output: [{file: `${configDir}/dist/dyo.esm.js`, format: 'esm', name: 'dyo', freeze: false, sourcemap: true}],
			plugins: [terser(options)]
		}
	]
}
