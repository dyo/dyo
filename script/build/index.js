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
const strict = `'use strict'/* eslint-disable */`
const filenames = {
	umd: 'umd.js',
	esm: 'esm.js',
	node: 'node.js',
	bridge: 'bridge.js'
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

const bridge = [
	...core
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

const factory = fs.readFileSync(path.join(__dirname, 'UMD.js'), 'utf8').trim()
const api = `
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
h: window.h = createElement`

const DOM = ((file) => {
	let content = fs.readFileSync(path.join(__dirname, file), 'utf8').trim()
			content = content.replace(/^((?!^\s*function[^'"])[\S\s])*$/gm, '')
			content = content.replace(/function\s*(\w+)\s*.*/g, '$1,').replace(/\s/g, '')

	return content.split(',')
})(dom[0])

const platform = `
exports,
Element,
mountComponentElement,
getComponentChildren,
invokeErrorBoundary,
getElementDefinition
`.replace(/\s+/g, ' ').trim()

const template = (type) => {
	switch (type) {
		case 'bridge':
			return `if (typeof require !== 'object') return function (r) { factory(window, r) }`
		default:
			return `if (typeof require === 'function') require(define)(${(platform)})`
	}
}

const parse = (head, body, tail, factory) => {
	return factory.replace(search,'\n'+pad(head+body+tail))
}

const builder = (file) => {
	return fs.readFileSync(path.join(__dirname, file), 'utf8')
}

const wrapper = (module, content, factory, version, license) => {
	var head = "var version = '"+version+"'\n\n"
	var expo = '\n'+'var exports = {\n'+pad(api.trim())+'\n}'+'\n\n'
	var temp = '\n\nreturn exports'
	var tail = expo+template('main')+temp

	switch (module) {
		case 'node': {
			return {
				head: comment(version, license),
				body: 'module.exports = function ('+(platform)+') {'+strict+
					'\n\n'+pad(content.trim())+'\n}',
				tail: ''
			}
		}
		case 'esm':
			return {
				head: comment(version, license),
				body: parse(head, content, expo+temp.trim(), factory),
				tail: 'export default dio\n'+
							api
								.replace(/[\S\s]*\{|\s*\}|,|\S\s*h:[\S\s]*|window.*h.*=\s*/g, '')
								.replace(/(\w+):\s*(\w+)/g, 'export const $1 = dio.$2 ')
								.trim()
			}
		case 'bridge':
			tail = DOM.map((func) => {
				if (content.indexOf(func) > -1 && func) {
					return `var ${func} = typeof require.${func} === 'function' ? require.${func} : noop`
				}
			}).filter(Boolean).join('\n')+'\n'

			tail = '\n'+tail+expo+template('bridge')+temp

			return {
				head: comment(version, license),
				body: parse(head, content, tail, factory),
				tail: ''
			}
		default:
			return {
				head: comment(version, license),
				body: parse(head, content, tail, factory),
				tail: ''
			}
	}
}

const comment = (version, license) => {
	return `/*! DIO ${version} @license MIT */\n\n`
}

const bundle = (module, files, location) => {
	let version = package.version
	let license = package.license
	let filename = filenames[module]
	let filepath = location+filename
	var factory = fs.readFileSync(path.join(__dirname, 'UMD.js'), 'utf8').trim()

	let content = wrapper(module, files.map(builder).join('\n'), factory, version, license)
			content = (content.head + content.body + '\n\n' + content.tail).trim()+'\n'

	fs.writeFileSync(path.join(__dirname, filepath), content)

	switch (module) {
		case 'esm':
			return minify(UglifyES, {content, filename, module, filepath})
		default:
			return minify(UglifyJS, {content, filename, module, filepath})
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
	// bundle('bridge', bridge, '../../dist/') // for another release/another package

	console.log(
		'\x1b[32m\x1b[1m\x1b[2m' + '\nBundled:\n'+
		'\n – '+filenames.umd+
		'\n – '+filenames.esm+
		'\n – '+filenames.node+
		// '\n – '+filenames.bridge+
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
