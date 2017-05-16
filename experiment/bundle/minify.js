const fs = require('fs');
const path = require('path');
const uglifyJS = require('uglify-js');

var bundle = uglifyJS.minify(['dio.js'], {
	conditionals: false,
	if_return: false,
	booleans: false,
});

fs.writeFileSync(path.resolve('./dio.min.js'), bundle.code);
