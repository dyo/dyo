const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const chokidar = require('chokidar')
const UglifyJS = require('uglify-js')
const package = require('../../package.json')

let filesize = NaN
let search = "'{%module%}'"

const options = {compress: {}}
const strict = `/* eslint-disable */'use strict'`
const filenames = {
	umd: 'umd.js',
	esm: 'esm.js',
	node: 'node.js',
	noop: 'noop.js'
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
	'../../src/Core/Find.js',
	'../../src/Core/Children.js',
	'../../src/Core/Render.js',
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
	'../../src/DOM/DOM.js'
]

const umd = [
	...core,
	...dom
]

const esm = [
	...core,
	...dom
]

const noop = [
	...core,
	'../../src/DOM/NOOP.js'
]

const server = `
Object.defineProperties(Element.prototype, {
	toJSON: {value: toJSON},
	toString: {value: toString},
	toStream: {value: toStream}
})

exports.renderToString = renderToString
exports.renderToNodeStream = renderToNodeStream
`

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
		case 'noop':
			return `
exports.__SECRET_INTERNALS__ = {
	mountComponentElement: mountComponentElement,
	getComponentChildren: getComponentChildren,
	invokeErrorBoundary: invokeErrorBoundary,
	getElementDefinition: getElementDefinition
}

if (typeof __require__ !== 'object')
	return function (config) {
		try {
			factory.call(config, window, config)
		} catch (e) {
			/* istanbul ignore next */
			console.error(err+'\\nSomething went wrong trying to create a custom renderer.')
		}
	}`
		default:
			return `
if (typeof __require__ === 'function')
	(function () {
		try {
			__require__('./node')(${(platform)})
		} catch (err) {
			/* istanbul ignore next */
			console.error(err+'\\nSomething went wrong trying to import the server module.')
		}
	}())`
	}
}

const parse = (head, body, tail, factory) => {
	return factory.replace(search,'\n'+pad(head+body+tail))
}

const builder = (file) => {
	return fs.readFileSync(path.join(__dirname, file), 'utf8')
}

const wrapper = (module, content, factory, version, license) => {
	var head = `var exports = {version: '${version}'}\n\n`
	var expo = '\n'+api.trim()+'\n\n'
	var temp = '\n\nreturn exports'
	var tail = expo+template('main').trim()+temp

	switch (module) {
		case 'node': {
			return {
				head: comment(version, license),
				body: 'module.exports = function ('+(platform)+') {'+strict+
					'\n\n'+pad(content.trim()+'\n\n'+server.trim())+'\n}',
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
		case 'noop':
			tail = expo+template('noop').trim()+temp

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
		case 'node':
			break
		default:
			minify(UglifyJS, {content, filename, module, filepath})
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

	if (compressed.error) {
		let {message, filename, line, col} = compressed.error
		return console.error(message, filename, `${line}:${col}`)
	}

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
		var kbSize = '~'+Math.trunc(size+.1)+'kb'

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
	// bundle('esm', esm, '../../dist/') // future? webpack seems to be shipping esm module incorrectly ATM
	bundle('node', node, '../../dist/')
	bundle('noop', noop, '../../dist/') // for another release/another package

	console.log(
		'build complete..'
	)
}

if ((process.argv.pop()+'').indexOf('watch') < 0) {
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
		console.log('\nchanged: ' + file)
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
