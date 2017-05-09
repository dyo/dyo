const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const shared = [
	'../src/Shared.js',
	'../src/Component.js',
	'../src/Element.js',
	'../src/Boundary.js',
	'../src/Attribute.js',
	'../src/Node.js',
	'../src/Render.js',
	'../src/Reconcile.js',
	'../src/DOM.js',
	'../src/Hydrate.js',
	'../src/Exports.js'
]

const main = shared.concat([])
const server = ['../src/Server.js']

const bundler = (file) => {
	return fs.readFileSync(path.join(__dirname, file), 'utf8');
}

const wrapper = (module) => {
	switch (module) {
		case 'server': {
			return {
				open: 'module.exports = function (exports, element, shape, extract, whitelist, object) {\n',
				close: '\n};\n'
			}
		}
		default: {
			return {
				open: fs.readFileSync(path.join(__dirname, 'umd.js'), 'utf8') + '\n',
				close: '\n}));\n'
			}
		}
	}
}

const build = (module, files, location) => {
	const container = wrapper(module)

	const bundle = (
		container.open +
		files.map(bundler).join('\n').replace(/^/gm, '\t') +
		container.close
	)

	fs.writeFileSync(path.join(__dirname, location), bundle)
}

const bootstrap = () => {
	build('main', main, '../dist/dio.js')
	build('server', server, '../dist/dio.server.js')

	console.log(
		'\x1b[32m\x1b[1m\x1b[2m' +
	 	'\nbuild > ../dist/dio.js'+
		'\x1b[0m\n'
	)
}

if ((process.argv.pop()+'').indexOf('--bundle') !== -1) {
	return bootstrap()
}

const watcher = (file) => {
	if (!file) {
		console.log('\nwatching..', 'src/')
	} else {
		console.log('changed > ' + file)
	}

	bootstrap()
}

const watch = chokidar.watch([
	'./src/',
], {ignored: /[\/\\]\./})

watch.on('change', watcher)
watch.on('ready', watcher)

process.stdout.write('\033c')
process.stdout.write("\033]0;" + 'dio bundle' + '\007')
