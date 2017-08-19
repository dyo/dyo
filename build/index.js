const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const UglifyJS = require('uglify-js')
const package = require('../package.json')
const options = {compress: {}}
const strict = `'use strict'`

const umd = [
	'../src/Core/Utility.js',
	'../src/Core/Element.js',
	'../src/Core/Constant.js',
	'../src/Core/Lifecycle.js',
	'../src/Core/Component.js',
	'../src/Core/Commit.js',
	'../src/Core/Reconcile.js',
	'../src/Core/Event.js',
	'../src/Core/Error.js',
	'../src/Core/DOM.js',
	'../src/Core/Render.js',
	'../src/Core/Hydrate.js'
]

const node = [
	'../src/Core/Utility.js',
	'../src/Server/Utility.js',
	'../src/Server/Constant.js',
	'../src/Core/Constant.js',
	'../src/Server/String.js',
	'../src/Server/JSON.js',
	'../src/Server/Stream.js',
	'../src/Server/Render.js'
]

const imports = 'Element, render, componentMount, commitElement'

const getExports = () => `
/**
 * @exports
 */
exports.version = version
exports.h = exports.createElement = window.h = createElement
exports.isValidElement = isValidElement
exports.cloneElement = cloneElement
exports.Component = Component

exports.hydrate = !server ? hydrate : noop
exports.render = !server ? render : __require__('./dio.node.js')(${imports})
`

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
				body: `module.exports = function (${imports}) {\n${pad(strict+'\n\n'+format(content))}\n}`,
				close: ''
			}
		}
		default: {
			return {
				open: (
					open+
					fs.readFileSync(path.join(__dirname, 'umd.js'), 
					'utf8').trim() + '\n\n' + 
					"\tvar version = '"+version+"'\n"+
					'\tvar server = __require__ !== window\n\n'
				),
				body: pad(format(content)),
				close: close
			}
		}
	}
}

const build = (module, files, location) => {
	let version = package.version
	let open = '/* DIO '+version+' */\n'
	let close = '\n}))'
	let public = module === 'umd' ? pad(getExports().trim()) : ''

	let content = wrapper(open, module, files.map(builder).join('\n'), close, version)
	let uncompressed = (content.open + content.body + '\n\n' + public + content.close).trim()+'\n'
	
	fs.writeFileSync(path.join(__dirname, location), uncompressed)

	if (module === 'umd') {
		let compressed = UglifyJS.minify(uncompressed)

		if (compressed.error) {
			console.error(compressed.error)
		} else {
			fs.writeFileSync(path.join(__dirname, location.replace('umd', 'min')), compressed.code)			
		}
	}
}

const resolve = () => {
	build('umd', umd, '../dist/dio.umd.js')
	build('node', node, '../dist/dio.node.js')

	console.log(
		'\x1b[32m\x1b[1m\x1b[2m' + '\nBuild: '+
		'\n  dio.umd.js,'+
		'\n  dio.node.js,'+
		'\n  dio.min.js'+
		'\x1b[0m\n'
	)
}

if ((process.argv.pop()+'').indexOf('--build') !== -1) {
	return resolve()
}

const watcher = (file) => {
	if (!file) {
		console.log('\nwatching..', 'src/')
	} else {
		if (file.indexOf('package.json') > -1) {
			delete require.cache[require.resolve('../package.json')];
			package.version = require('../package.json').version
		}
		console.log('changed > ' + file)
	}

	resolve()
}

const watch = chokidar.watch(['./src/', 'package.json'], {ignored: /[\/\\]\./})

watch.on('change', watcher)
watch.on('ready', watcher)

process.stdout.write('\033c')
process.stdout.write("\033]0;" + 'DIO build' + '\007')
