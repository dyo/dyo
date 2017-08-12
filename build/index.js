const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const UglifyJS = require('uglify-js')
const package = require('../package.json')
const options = {compress: {}}

const umd = [
	'../src/Core/Constant.js',
	'../src/Core/Utility.js',
	'../src/Core/Element.js',
	'../src/Core/Lifecycle.js',
	'../src/Core/Component.js',
	'../src/Core/Commit.js',
	'../src/Core/Reconcile.js',
	'../src/Core/Render.js',
	'../src/Core/Event.js',
	'../src/Core/Error.js',
	'../src/Core/Shared.js',
	'../src/Core/DOM.js'
]

const node = [
	'../src/Server/Constant.js',
	'../src/Server/Utility.js',
	'../src/Server/Render.js'
]

const getExports = () => `
var exports = {
	h: createElement,
	createElement: createElement,
	Component: Component,
	render: render,
	isValidElement: isValidElement,
	cloneElement: cloneElement
}

if (server)
	__require__('dio.node.js')(exports)
else
	window.h = createElement

return exports
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
				body: format(content),
				close: ''
			}
		}
		default: {
			return {
				open: (
					open+
					fs.readFileSync(path.join(__dirname, 'umd.js'), 
					'utf8').trim() + '\n\n' + 
					"\tvar version = '"+version+"'\n"
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
	let public = pad(getExports().trim())

	let content = wrapper(open, module, files.map(builder).join('\n'), close, version)
	let uncompressed = (content.open + content.body + '\n\n' + public + content.close).trim()
	
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
