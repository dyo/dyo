var fs   = require('fs');
var path = require('path');

function build (source, destination) {
	var output   = '';
	var template = fs.readFileSync(source, 'utf8');
	var regex    = /\trequire\('(.*?)'\);/g;

	var output = template.replace(regex, function (match, capture, str) {
		return fs.readFileSync(path.normalize(__dirname+'/'+capture), 'utf8').replace(/^/gm, '\t');
	});

	fs.writeFileSync(destination, output, 'utf8');
}

function report (time, filename, event) {
	console.log((filename || '') + ' ' + (event || '') + ' [Build Finished in ' + (Date.now() - time) + 'ms]');
}

var destination = path.normalize(__dirname+'/../dio.js');
var directory   = path.normalize(__dirname+'/../src/');
var source      = directory + 'index.js';

fs.watch(directory, function (event, filename) {
	var start = Date.now();

    try {
    	build(source, destination);
    	report(start, filename, event);
    } catch (error) {
    	console.log(error);
    }
});

var start = Date.now();

build(source, destination);

report(start);

console.log('\n  ...watching for changes in ./src\n');