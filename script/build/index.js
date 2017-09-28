const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const chokidar = require('chokidar')
const UglifyJS = require('uglify-js')
const UglifyES = require("uglify-es")
const package = require('../../package.json')

let filesize = NaN
let search = "'{%module%}'"

const options = {compress: {}}
const strict = `'use strict'`
const filenames = {
	umd: 'umd.js',
	esm: 'esm.js',
	node: 'node.js'
}

const shared = [
'../../src/Core/Shared.js'
]

const core = [
	...shared,
	'../../src/Core/Utility.js',
	'../../src/Core/Constant.js',
	'../../src/Core/Element.js',
	'../../src/Core/Component.js',
	'../../src/Core/Commit.js',
	'../../src/Core/Reconcile.js',
	'../../src/Core/Event.js',
	'../../src/Core/Error.js',
	'../../src/Core/Children.js',
	'../../src/Core/Render.js'
]

const node = [
	...shared,
	'../../src/Server/Utility.js',
	'../../src/Server/Constant.js',
	'../../src/Server/String.js',
	'../../src/Server/JSON.js',
	'../../src/Server/Stream.js',
	'../../src/Server/Render.js'
]

const dom = [
	'../../src/DOM/DOM.js',
]

const umd = [
	...core,
	...dom
]

const esm = [
	...core,
	...dom
]

/**
 * @return {string}
 */
const transform = (str) => {
	return str.replace(/,?\s*.*h\b.*:.*/g, '')
						.replace(/\s*(\w+):\s+\S+,?/gm, '$1,\n')
						.trim()
						.replace(/,$/, '')
}

const pad = (content, tabs) => {
	if (tabs > 1)
		return content.replace(/^/gm, '\t\t')
	else
		return content.replace(/^/gm, '\t')
}

var factory = fs.readFileSync(path.join(__dirname, 'UMD.js'), 'utf8').trim()
var exports = `
var exports = {
version: version,
render: render,
hydrate: hydrate,
Component: Component,
PureComponent: PureComponent,
Children: Children,
findDOMNode: findDOMNode,
unmountComponentAtNode: unmountComponentAtNode,
cloneElement: cloneElement,
isValidElement: isValidElement,
createPortal: createPortal,
createElement: createElement,
DOM: DOM,
h: window.h = createElement
}
`

const platform = `
Element,
mountComponentElement,
unmountComponentElement,
getComponentElement,
getComponentChildren,
invokeErrorBoundary,
getElementFrom,
getElementDescription`

const template = () => {
	return `\
if (require)
createDOMClient.call(window, require(define).call(
exports, ${(platform)}
),
factory
)
`
}

const parse = (head, body, tail, factory) => {
	return factory.replace(
		search,
		'\n'+
		pad(
			head+
			format(body)+
			'\n'+
			exports+
			'\n'+
			template()+
			'\nreturn exports'
		)
	)
}


const builder = (file) => {
	return fs.readFileSync(path.join(__dirname, file), 'utf8');
}

const format = (content) => content.trim()
	.replace(/\s*import\s+[\S\s]+?['`"][\S\s]+?\.js['"`]\s*/g, '\n')
	.replace(/(^\s*)export\s+/gm, '$1').replace(/\n\n\n+/g, '\n\n')

const wrapper = (module, content, version, factory) => {
	var head = "var version = '"+version+"'\n\n"
	
	switch (module) {
		case 'node': {
			return {
				head: '',
				body: 'module.exports = function ('+(platform)+'\n) {'+strict+
					('\n\n'+format(content))+'\n\n}',
				tail: ''
			}
		}
		case 'esm':
			return {
				head: '',
				body: parse(head, content, '', factory),
				tail: 'export default dio\n'+
							exports
								.replace(/[\S\s]*\{|\s*\}|,|\S\s*h:[\S\s]*|window.*h.*=\s*/g, '')
								.replace(/(\w+):\s*(\w+)/g, 'export const $1 = dio.$2 ')
								.trim()
			}
		default:
			return {
				head: '',
				body: parse(head, content, '', factory),
				tail: ''
			}
	}
}

const comment = (version, license) => ''

const bundle = (module, files, location) => {
	let version = package.version
	let filename = filenames[module]
	let filepath = location+filename
	var factory = fs.readFileSync(path.join(__dirname, 'UMD.js'), 'utf8').trim()

	let content = wrapper(module, files.map(builder).join('\n'), version, factory)
			content = (content.head + content.body + '\n\n' + content.tail).trim()+'\n'

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
	'./script/build/UMD.js',
	'./src/', 
	'./package.json',
	], {ignored: /[\/\\]\./})

watch.on('change', watcher)
watch.on('ready', watcher)

process.stdout.write('\033c')
process.stdout.write("\033]0;" + 'DIO bundle' + '\007')
