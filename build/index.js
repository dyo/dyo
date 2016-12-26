'use strict';


var fs = require('fs');
var path = require('path');
var proc = require("child_process");
var build = require('./builder');

// hidden files
var hidden  = /(?:^|\/)\.[^\/\.]|node_modules$|npm-debug\.log$/g;
var ext = '.js';

// report status
function report (start, filename, event) {
	var timestamp = new Date + '';

	console.log(
		(filename || '') + ' ' + 
		(event || '') + 
		' [Build Finished in ' + 
		(Date.now() - start) + 'ms]'
	);
}

/**
 * walk & create list of all files directory, recursively
 * 
 * @param  {string} directory
 * @param  {Object} callback
 * @return {Object}
 */
function walk (directory, callback) {
	var files = fs.readdirSync(path.resolve(directory));

	// iterate through all files in directory, if a file is
	// a directory recursively walk the tree
	for (var i = 0, length = files.length; i < length; i++) {
		var filename = files[i];

		// ignore hidden files i.e `.cache/.DS_Store` and node_modules ...
		if (filename[0] !== '.' && !hidden.test(filename)) {
			var filepath = path.join(directory, filename);

			if (fs.statSync(filepath).isDirectory()) {
				// directory, recursive walk
				walk(filepath, callback);
				callback(filepath);
			}
		}
	}
}

function watcher (parent, builds) {
	parent = parent.replace('../', '');

	if (parent[parent.length-1] !== '/') {
		parent += '/';
	}

	return function (event, filename) {
		// keep track of build time
		var start = Date.now();

	    try {
	    	for (var name in builds) {
	    		var sources = builds[name];
	    		
	    		var directory = path.normalize(path.join(__dirname, sources[0]));
	    		var parent = path.normalize(path.join(__dirname, sources[1]));
	    		var destination = path.normalize(path.join(__dirname, sources[2]));
	    		var entry = path.normalize(path.join(directory, sources[3]));

	    		// build
	    		build(directory, destination, entry, ext);
	    	}
	    	// report build complete
	    	report(start, parent+filename, event);
	    } catch (error) {
	    	console.log(error);
	    }
	}
}

function bootstrap () {
	var builds = {
		nano: ['../packages/nano/', '../packages/nano/', '../packages/nano/dio.js', 'index.js'],
		main: ['../src/', '../src/', '../dio.js', 'index.js'],
		docs: ['../src/', '../src/', '../docs/assets/dio.js', 'index.js'],
	};

	// log watching status
	console.log('\n  ...watching for changes');

	for (var name in builds) {
		var sources = builds[name];

		var directory = path.normalize(path.join(__dirname, sources[0]));
		var parent = path.normalize(path.join(__dirname, sources[1]));
		var destination = path.normalize(path.join(__dirname, sources[2]));
		var entry = path.normalize(path.join(directory, sources[3]));

		var watch = function (filepath) {
			fs.watch(filepath, watcher(filepath, builds));
		};

		build(directory, destination, entry, ext);

		if (name === 'main' || name === 'docs') {
			fs.watch(directory, watcher(parent, builds));
			walk(directory, watch);
		} else {
			walk(parent, watch);
		}
	}
}

bootstrap();