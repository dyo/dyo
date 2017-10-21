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
	cjs: 'cjs.js'
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
	'../../src/Core/Factory.js',
	'../../src/Core/Children.js',
	'../../src/Core/Render.js',
]

const cjs = [
	...shared,
	'../../src/Server/Utility.js',
	'../../src/Server/String.js',
	'../../src/Server/JSON.js',
	'../../src/Server/Stream.js',
	'../../src/Server/Render.js'
]

const dom = [
	'../../src/DOM/DOM.js',
	'../../src/DOM/Client.js'
]

const umd = [
	...core,
	...dom
]

const esm = [
	...core,
	...dom
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
exports.Fragment = Fragment
exports.PureComponent = PureComponent
exports.Children = Children
exports.findDOMNode = findDOMNode
exports.unmountComponentAtNode = unmountComponentAtNode
exports.createFactory = createFactory
exports.cloneElement = cloneElement
exports.isValidElement = isValidElement
exports.createPortal = createPortal
exports.createElement = createElement
exports.h = createElement
`

const internals = `
exports,
Element,
getComponentChildren,
getComponentElement,
getElementDefinition,
mountComponentElement,
invokeErrorBoundary
`.replace(/\s+/g, ' ').trim()

const template = `
if (typeof require === 'function')
	(function () {
		try {
			require('./cjs')(${internals})
		} catch (err) {
			/* istanbul ignore next */
			console.error(err+'\\nSomething went wrong trying to import the server module.')
		}
	}())

if (typeof config === 'object' && typeof config.createExport === 'function') {
	return config.createExport(${internals}) || exports
}
`.trim()

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
	var tail = expo+template+temp

	switch (module) {
		case 'cjs': {
			return {
				head: comment(version, license),
				body: 'module.exports = function ('+(internals)+') {'+strict+
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
		case 'cjs':
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
	bundle('cjs', cjs, '../../dist/')

	console.log('build complete..')
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
