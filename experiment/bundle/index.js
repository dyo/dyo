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
	'../src/DOM.js'
];

const server = main.concat([
	'../src/Server.js'
]);

const bundler = (file) => {
	return fs.readFileSync(path.join(__dirname, file), 'utf8');
}

function build (module, files, location) {
	location = path.join(__dirname, location);
	let umd = fs.readFileSync(path.join(__dirname, '../exports/umd.js'), 'utf8');
	let exported = fs.readFileSync(path.join('exports', module+'.js'), 'utf8');
	let bundle = (
		umd + '\n' +
		(
			files.map(bundler).join('\n') +
			'\n' + exported
		).replace(/^/gm, '\t') +
		'\n}));\n'
	);

	fs.writeFileSync(location, bundle);
}

function bootstrap () {
	build('main', main, '../dist/dio.js');
	build('server', server, '../dist/dio.server.js');

	console.log(
		'\x1b[32m\x1b[1m\x1b[2m' +
	 	'\nbuild > ../dist/dio.js, ./dist/dio.server.js'+
		'\x1b[0m\n'
	);
}

if ((process.argv.pop()+'').indexOf('--bundle') !== -1) {
	return bootstrap();
}

const watcher = (file) => {
	if (!file) {
		console.log('\nwatching..', 'src/');
	} else {
		console.log('changed > ' + file);
	}
	bootstrap();
}

var watch = chokidar.watch([
	'./src/',
	'./exports'
], {ignored: /[\/\\]\./});

watch.on('change', watcher);
watch.on('ready', watcher);

process.stdout.write('\033c');
process.stdout.write("\033]0;" + 'dio bundle' + '\007');
