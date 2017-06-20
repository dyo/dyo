const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');

const main = [
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

const server = ['../src/Server.js']

const bundler = (file) => {
	return fs.readFileSync(path.join(__dirname, file), 'utf8');
}

const wrapper = (module, body) => {
	switch (module) {
		case 'server': {
			return {
				open: '',
				body: body,
				close: ''
			}
		}
		default: {
			return {
				open: fs.readFileSync(path.join(__dirname, 'umd.js'), 'utf8') + '\n',
				body: body.replace(/^/gm, '\t'),
				close: '\n}));\n'
			}
		}
	}
}

const build = (module, files, location) => {
	const content = wrapper(module, files.map(bundler).join('\n'))
	const bundle = content.open + content.body + content.close;

	fs.writeFileSync(path.join(__dirname, location), bundle)
}

const bootstrap = () => {
	build('main', main, '../dio.js')
	build('server', server, '../dio.server.js')

	console.log(
		'\x1b[32m\x1b[1m\x1b[2m' +
	 	'\nbuild > dio.min.js, dio.server.js'+
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
