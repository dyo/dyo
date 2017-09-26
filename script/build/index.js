const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const chokidar = require('chokidar')
const UglifyJS = require('uglify-js')
const UglifyES = require("uglify-es")
const package = require('../../package.json')

let filesize = NaN

const options = {compress: {}}
const strict = `'use strict'`
const filenames = {
	umd: 'dio.umd.js',
	esm: 'dio.esm.js',
	min: 'dio.min.js',
	node: 'dio.node.js',
	map: 'dio.js.map'
}

const core = [
	'../../src/Core/Shared.js',
	'../../src/Core/Utility.js',
	'../../src/Core/Constant.js',
	'../../src/Core/Element.js',
	'../../src/Core/Component.js',
	'../../src/Core/Commit.js',
	'../../src/Core/Reconcile.js',
	'../../src/Core/Event.js',
	'../../src/Core/Error.js',
	'../../src/Core/Render.js',
	'../../src/Core/Children.js'
]

const dom = [
	'../../src/DOM/DOM.js',
]

const node = [
	'../../src/Core/Shared.js',
	'../../src/Server/Utility.js',
	'../../src/Server/Constant.js',
	'../../src/Server/String.js',
	'../../src/Server/JSON.js',
	'../../src/Server/Stream.js',
	'../../src/Server/Render.js'
]

const umd = [
	...core,
	...dom
]

const esm = [
	...core,
	...dom
]

const getExports = (module) => {
	switch (module) {
		case 'umd':
			return template.export + template.node
		case 'esm':
			return template.module
	}
}

/**
 * @return {string}
 */
const transform = (str) => {
	return str.replace(/.*\.h[\s=].*/g, '')
						.replace(/(export)s\.(\w+).*/g, '\t$2,')
						.trim()
}

const api = `
exports.version = version
exports.render = render
exports.hydrate = hydrate
exports.Component = Component
exports.PureComponent = PureComponent
exports.Children = Children
exports.findDOMNode = findDOMNode
exports.unmountComponentAtNode = unmountComponentAtNode
exports.cloneElement = cloneElement
exports.isValidElement = isValidElement
exports.createPortal = createPortal
exports.createElement = createElement
exports.h = window.h = createElement
`

const imports = 'exports, Element, mountComponent, commitElement, getComponentElement, invokeErrorBoundary'
const template = {
	node: `\nrequire && require('./dio.node.js')(${imports})`,
	export: api,
	module: `
var exports = {}
${api}
export default exports
export {
	${transform(api)}
	createElement as h
}`
}

const builder = (file) => {
	return fs.readFileSync(path.join(__dirname, file), 'utf8');
}

const parse = (v) => {
	switch (/\w as \w/.test(v)) {
		case true:
			return parse(v.substring(v.lastIndexOf(' as ')+4).trim())
			.replace(/\w*$/, v.substring(0, v.indexOf(' as ')).trim())
		case false:
			return '\n\t'+ v.trim() + ': ' + v.trim()
	}
}

const format = (content) => content.trim()
	.replace(/\s*import\s+[\S\s]+?['`"][\S\s]+?\.js['"`]\s*/g, '\n')
	.replace(/(^\s*)export\s+/gm, '$1').replace(/\n\n\n+/g, '\n\n')

const pad = (content) => content.replace(/^/gm, '\t')

const wrapper = (open, module, content, close, version) => {
	switch (module) {
		case 'node': {
			return {
				open: open,
				body: `module.exports = function (${imports}) {\n${pad('\n'+strict+'\n\n'+format(content))}\n}`,
				close: ''
			}
		}
		case 'esm':
			return {
				open: (
					open+
					"var version = '"+version+"'\n\n"
				),
				body: format(content),
				close: ''
			}
		default:
			return {
				open: (
					open+
					fs.readFileSync(path.join(__dirname, 'UMD.js'), 
					'utf8').trim() + '\n\n' + 
					"\tvar version = '"+version+"'\n\n"
				),
				body: pad(format(content)),
				close: close
			}
	}
}

const comment = (version, license) => `
/*! DIO ${version} @license ${license} */\n
`

const bundle = (module, files, location) => {
	let version = package.version
	let license = package.license
	let open = comment(version, license)
	let close = '\n}))'
	let public = ''
	let filename = filenames[module]
	let filepath = location+filename

	switch (module) {
		case 'umd':
			public += pad(getExports(module).trim())
			break
		case 'esm':
			public += getExports(module).trim()
			break
	}

	let content = wrapper(open, module, files.map(builder).join('\n'), close, version)
			content = (content.open + content.body + '\n\n' + public + content.close).trim()+'\n'
	
	fs.writeFileSync(path.join(__dirname, filepath), content)

	switch (module) {
		case 'node':
		case 'umd':
			return minify(UglifyJS, {content, filename, module, filepath})
		case 'esm':
			return minify(UglifyES, {content, filename, module, filepath})
	}
}

const minify = (uglify, {content, module, filename, filepath}) => {
	const min = filepath.replace(module, module+'.min')
	const map = min.replace('.js', '.js.map')

	if (module === 'umd')
		content = content.replace(/(dio\.\w+).(\js)/, '$1.min.$2')

	const compressed = uglify.minify({[filename]: content}, {
    sourceMap: {
      filename: filename,
      url: filename.replace('.js', '.min.js.map')
    }
	})

	if (compressed.error)
		return console.error(compressed.error)

	if (module === 'umd') {
		gzipsize(compressed.code)
	}

	fs.writeFileSync(path.join(__dirname, min), compressed.code)
	fs.writeFileSync(path.join(__dirname, map), compressed.map)
}

const estimate = (num) => {
	return '~'+num+'kb'
}

const gzipsize = (content) => {
	var size = parseInt(zlib.gzipSync(content, {level: 9}).length)/1000

	if (size !== filesize) {
		var kbSize = '~'+Math.trunc(size)+'kb'

		if (Math.trunc(size) !== Math.trunc(filesize)) {
			var readpath = path.join(__dirname, '../../README.md')

			fs.writeFileSync(readpath, fs.readFileSync(readpath).toString().replace(/(-\s+)~?\d+kb/, '$1'+kbSize))
		}
	}

	console.log('\ngzip: ~' + (filesize ? filesize + 'kb –> ~' : '') +size+'kb')

	filesize = size
}

const resolve = () => {
	bundle('umd', umd, '../../dist/')
	bundle('esm', esm, '../../dist/')
	bundle('node', node, '../../dist/')

	console.log(
		'\x1b[32m\x1b[1m\x1b[2m' + '\nBundled:\n'+
		'\n – '+filenames.umd+
		'\n – '+filenames.esm+
		'\n – '+filenames.node+
		'\x1b[0m\n'
	)
}

if ((process.argv.pop()+'').indexOf('--bundle') !== -1) {
	return resolve()
}

const watcher = (file) => {
	if (!file) {
		console.log('\nwatching..', 'src/')
	} else {
		if (file.indexOf('package.json') > -1) {
			delete require.cache[require.resolve('../../package.json')];
			Object.assign(package, require('../../package.json'))
		}
		console.log('changed > ' + file)
	}

	resolve()
}

const watch = chokidar.watch([
	'./scripts/build/UMD.js',
	'./src/', 
	'./package.json',
	], {ignored: /[\/\\]\./})

watch.on('change', watcher)
watch.on('ready', watcher)

process.stdout.write('\033c')
process.stdout.write("\033]0;" + 'DIO bundle' + '\007')
