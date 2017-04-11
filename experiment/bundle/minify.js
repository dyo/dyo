const fs = require('fs');
const path = require('path');
const uglifyJS = require('uglify-js');

var bundle = uglifyJS.minify(['dist/dio.js'], {
	conditionals: false,
	if_return: false,
	booleans: false,
});

fs.writeFileSync(path.resolve('./dist/dio.min.js'), bundle.code);
