/**
 * given an entry point and watch directory
 * this build process watches for changes and builds a bundle to
 * the given destination similar with support for ES6
 * import 'file' and import 'file' as variable;
 */


'use strict';


var fs = require('fs');
var path = require('path');
var proc = require("child_process");

var normalize = path.normalize;
var execFile = proc.execFile;

// captures lines with require('..') and import '..'
var regexImport = /^.*?(?:import).*'(.*?)'(?: as (.[^;]*).*|.*)/gm;

// capture number of tabs at the beginning of a string
var regexTab = /^\t*/gm;

// capture beginning of string 
var regexLine = /^/gm;

// capture whitespace at the end of a string
var regexWhitespace = /\s*$/;

// capture exports
var regexExports = /^[^/]*?export(?: function |\{| )(.*)(?:\(|\}?)/gm;

// capture export & export default statements for removal
var regexExportsRm = /export default |export /g;

// cleanup exports statments
var regexExportsCleanUp = /export {.*}.*|export .*;/gm;

// cleanup export default
var regexExportDefault = /export default /g;


// resolve imports
function resolve (directory, template, imported) {
	// replace all require/import lines with the resolved import/file
	return template.replace(regexImport, function (match, filepath, namespace) {
		// resolve filepath
		var filepath = normalize(directory+filepath);

		// get number of tabs at the beginning of a line
		var tabs = match.match(regexTab)[0];

		var commentIndex = match.indexOf('//');
		var captureIndex = match.indexOf(filepath);
		var content = '';
		var cleanup = true;
		var alias = imported[filepath];

		// ignore comments, and only import once per file
		if ((commentIndex > -1 && commentIndex < captureIndex) || alias) {
			
			if (namespace && alias && alias !== true) {
				content = 'var ' + namespace + ' = ' + alias + ';';
			}
		} else {
			// cache
			imported[filepath] = namespace || true;

			// retrieve file contents
			content = fs.readFileSync(filepath, 'utf8');

			if (namespace) {
				// exports list
				var exported = [];

				content = content.replace(regexExportDefault, 'export ');

				// collect exports
				content.replace(regexExports, function (match, name) {
					var first = name[0] === '{';

					// {export1, export2, ...}
					if (first && name.length > 1 && name.indexOf(':') < 0) {
						name.replace(/\{|\}|;/g, '').split(',').forEach(function (value) {
							exported[exported.length] = value.trim();
						});
					} else if (!first) {
						var index = name.indexOf(' (');

						if (index > -1) {
							// export function ...
							exported[exported.length] = name.substr(0, index);
						} else {
							// export variable;
							var last = name.length-1;
							exported[exported.length] = name[last] === ';' ? name.substr(0, last) : name;
						}
					}
				});

				var output;

				if (exported.length > 1) {
					output = 'return {\n\t'+exported.map(value => value + ': '+value).join(', \n\t')+'\n};';
				} else if (exported.length === 1){
					output = 'return '+ exported[0] + ';';					
				} else {
					output = '';
				}

				var whitespace = '';

				// store and trim whitespace
				content = content.replace(regexLine, '\t').replace(regexWhitespace, function (match) {
					return (whitespace = match, '');
				});

				if (output) {
					content += ('\n\n\n' + output).replace(regexLine, tabs);
				}

				// create IIFE block, append trimmed whitespace
				content = 'var ' + namespace + ' = (function () {\n' + content + '\n}());' + whitespace;
			}

			content = content.replace(regexExportsCleanUp, '');
			cleanup = false;

			// recursive try to resolve any imports from sub file, 
			// then append tabs to match indent style
			content = resolve(directory, content, imported);
		}

		if (content) {
			if (cleanup) {
				content = content.replace(regexExportsCleanUp, '');
			}

			content = content.replace(regexExportsRm, '');

			test(content);

			return content.replace(regexLine, tabs);
		} else {
			return '';
		}
	});
}

// test if the code throws errors
function test (code, filepath) {
	try {
		new Function(code);
	} catch (err) {
		if (err.message.indexOf('token import') || err.message.indexOf('token export')) {
			return;
		}

		execFile('node', [filepath], function (error) {
			if (error) {
				var message = (
					'\x1b[31m' + 
					error.message.replace('Command failed: node '+filepath, '') + 
					'\x1b[0m'
				);

				console.error(message);
			}
		});
	}
}


// build output
function build (directory, destination, filepath) {
	var output = '';
	var imported = {};

	// retrieve entry files content
	var content = fs.readFileSync(filepath, 'utf8');

	test(content, filepath);

	// resolve(recursively)
	var output = resolve(directory, content, imported);

	// write to filesystem(destination) when done
	fs.writeFileSync(destination, output, 'utf8');
}


// report status
function report (start, filename, event) {
	console.log((filename || '') + ' ' + (event || '') + ' [Build Finished in ' + (Date.now() - start) + 'ms]');
}


// start
function bootstrap (directory, destination, entry) {
	// destination to write to
	destination = normalize(__dirname + '/' + destination);
	// directory to watch
	directory = normalize(__dirname + '/' + directory);
	// entry file
	entry = directory + (entry || 'index.js');

	// start initial build timer
	var start = Date.now();

	// run initial build
	build(directory, destination, entry);

	// report build time
	report(start);

	// log watching status
	console.log('\n  ...watching for changes in ./src\n');

	// start watching directory
	fs.watch(directory, function (event, filename) {
		var start = Date.now();

	    try {
	    	build(directory, destination, entry);
	    	report(start, filename, event);
	    } catch (error) {
	    	console.log(error);
	    }
	});
}


if (require.main === module) {
	// command line
	var argv = process.argv.splice(2);
	bootstrap(argv[0], argv[1], argv[2]);
} else {
	// require
	module.exports = bootstrap;
}