/**
 * build
 * 
 * given an entry point and watch directory
 * this build process watches for changes and builds a bundle to
 * the given destination similar with support for ES6
 * import 'file' and import 'file' as variable;
 *
 * supports:
 *
 * import "module-name"
 * import "module-name" as alias
 * 
 * todo: 
 * 
 * import defaultMember from "module-name";
 * import {one, two} from 'file.js'
 * publish to npm and create its own repo
 *
 * note: run the output through uglify/google closure to get dead code elimination
 */


'use strict';


var fs = require('fs');
var path = require('path');
var proc = require("child_process");

var normalize = path.normalize;
var execFile = proc.execFile;

// captures lines with import '..'
var regexImport = new RegExp(
	(
		`^.*?(?:import)[\\t ]+(?:'|")(.*?)(?:'|")(?: as (.[^;]*).*|.*)|`+
		`^.*?(?:import)[\\t ]+(.*?)[\\t ]from[\\t ](?:'|")(.*)(?:'|").*`
	),
	'gm'
);
// /^.*?(?:import)[\t ]+(?:'|")(.*?)(?:'|")(?: as (.[^;]*).*|.*)|^.*?(?:import)[\t ]+(.*?)[\t ]from[\t ](?:'|")(.*)(?:'|").*/gm

var regexImport1 = /^.*?(?:import)[\t ]+(?:'|")(.*?)(?:'|")(?: as (.[^;]*).*|.*)/gm;

var regexImport2 = /^.*?(?:import)[\t ]+(.*?)[\t ]from[\t ](?:'|")(.*)(?:'|").*/gm;

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

// format namespace
var formatNamespace = /\{|\}| /g;

// format module name
var formatModuleName = /\.|\/|js/g;


/**
 * generate random string of a certain length
 * 
 * @param  {number} length
 * @return {string}
 */
function random (length) {
    var text     = '';
    var possible = 'JrIFgLKeEuQUPbhBnWZCTXDtRcxwSzaqijOvfpklYdAoMHmsVNGy';

    for (var i = 0; i < length; i++) {
        text += possible[Math.floor(Math.random() * 52)];
    }

    return text;
}


// resolve imports
function resolve (directory, template, imported) {
	// replace all require/import lines with the resolved import/file
	// return template.replace(regexImport, function (match, filepath, namespace) {
	return template.replace(regexImport, function (match, group1, group2, group3, group4) {
		var type;
		var filepath;
		var namespace;
		var importList;

		if (group3) {
			filepath = group4;

			if (match.indexOf('{') > -1) {
				// import {one, two} from 'module-name';
				type = 3;

				group3 = group3.replace(formatNamespace, '');;
				importList = group3.split(',');
				namespace = filepath.replace(formatModuleName, '');
			} else {
				// import defaultMember from "module-name";
				type = 4;
				namespace = group3;
			}
		} else {
			filepath = group1;

			if (group2) {
				// import "module-name" as alias;
				type = 2;
				namespace = group2;
			} else {
				// import "module-name";
				type = 1;
			}
		}

		// if no file extension
		// the default is assumed to be a js file
		// thus 'module-name' is converted to 'module-name.js'
		if (filepath.indexOf('.') === -1) {
			filepath += '.js';
		}

		// resolve filepath
		var filepath = normalize(directory+filepath);

		// get number of tabs at the beginning of a line
		var tabs = match.match(regexTab)[0];

		var commentIndex = match.indexOf('//');
		var captureIndex = match.indexOf(filepath);

		var content = '';
		var cleanup = true;

		// if a file has already been imported, this will register something
		var alias = imported[filepath];

		// ignore comments, and only import once per file
		if ((commentIndex > -1 && commentIndex < captureIndex) || alias) {
			
			if (type < 3 && namespace && alias && alias !== true) {
				content = 'var ' + namespace + ' = ' + alias + ';';
			} else if (type !== 2) {
				content = namespace;
			}
		} else {
			// retrieve file contents
			content = fs.readFileSync(filepath, 'utf8');

			if (type !== 1) {
				// exports list
				var exported = [];

				// remove default exports, treat all exports the same
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
					// more than 1 export
					output = '\treturn {\n\t\t'+exported.map(value => value + ': '+value).join(', \n\t\t')+'\n\t};';
				} else if (exported.length === 1){
					// only one export
					output = '\treturn '+ exported[0] + ';';					
				} else {
					// nothing exported
					output = '';
				}

				// we want to format the IIFE block
				var whitespace = '';

				// store and trim whitespace
				content = content.replace(regexLine, '\t').replace(regexWhitespace, function (match) {
					return (whitespace = match, '');
				});

				if (output) {
					content += ('\n\n\n' + output).replace(regexLine, tabs);
					// create IIFE block, append trimmed whitespace
					content = '(function () {\n' + content + '\n}());' + whitespace;
				}

				content = 'var ' + namespace + ' = ' + content;

				if (type === 2) {
					// import "module1" as alias
				} else if (type === 4) {
					// import add from "module2"
				} else {
					// import {add, substract} from 'module3'

					var ns = '\n\n';
					content += '\n\n';

					for (var i = 0, length = importList.length; i < length; i++) {
						var importName = importList[i];
						var reference = 'var '+importName+' = '+namespace+'.'+importName+';\n';

						content += reference;
						ns += reference;
					}

					content += '\n';
					namespace = ns + '\n';
				}
			}

			// cleanup exports
			content = content.replace(regexExportsCleanUp, '');
			cleanup = false;

			// cache
			imported[filepath] = namespace || true;

			// recursive try to resolve any imports from sub file, 
			// then append tabs to match indent style
			content = resolve(directory, content, imported);
		}

		if (content) {
			// cleanup exports if it hasn't been done yet
			if (cleanup) {
				content = content.replace(regexExportsCleanUp, '');
			}

			// remove export statements
			content = content.replace(regexExportsRm, '');

			// test the code(imported module) for errors
			test(content);

			// append tabs to match position of import statement
			content = content.replace(regexLine, tabs);

			return content;
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
		// ignore import/export syntax errors
		if (err.message.indexOf('token import') || err.message.indexOf('token export')) {
			return;
		}

		// log all other errors
		execFile('node', [filepath], function (error) {
			if (error) {
				// format message
				var message = (
					'\x1b[31m' + 
					error.message.replace('Command failed: node '+filepath, '') + 
					'\x1b[0m'
				);

				// log
				console.error(message);
			}
		});
	}
}


// build output
function build (directory, destination, filepath) {
	var output = '';
	// cache of imported modules
	var imported = {};

	// retrieve entry files content
	var content = fs.readFileSync(filepath, 'utf8');

	// test the code(entry module) for errors
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
	entry = normalize(directory + (entry || 'index.js'));

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
		// keep track of build time
		var start = Date.now();

	    try {
	    	// build
	    	build(directory, destination, entry);
	    	// report build complete
	    	report(start, filename, event);
	    } catch (error) {
	    	console.log(error);
	    }
	});
}


if (require.main === module) {
	// used via command line
	var argv = process.argv.splice(2);
	bootstrap(argv[0], argv[1], argv[2]);
} else {
	// used via require()
	module.exports = bootstrap;
}