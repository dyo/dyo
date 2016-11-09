var fs = require('fs');
var path = require('path');

function build (source, destination) {
	var output   = '';
	var template = fs.readFileSync(source, 'utf8');
	var regex    = /\trequire\(\'(.*?)\'\);/g;

	var output = template.replace(regex, function (match, capture, str) {
		return fs.readFileSync(path.normalize(__dirname+'/'+capture), 'utf8').replace(/^/gm, '\t');
	});

	fs.writeFileSync(destination, output, 'utf8');
}

var source      = path.normalize(__dirname+'/../src/index.js');
var destination = path.normalize(__dirname+'/../dio.js');

console.log('watching for changes in ./src\n\n...\n');

fs.watch(source, function (event, filename) {
	var start = Date.now();

    try {
    	build(source, destination);
    	console.log((filename || '') + ' ' + event + ' [Build Finished in ' + (Date.now() - start) + 'ms]');
    } catch (e) {
    	console.log(e);
    }
});

build(source, destination);

