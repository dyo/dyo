const fs = require('fs')
const path = require('path')
const UglifyJS = require('uglify-js')
const content = fs.readFileSync(path.resolve('./dist/dio.umd.js'), 'utf8')
const options = {
	compress: {
		conditionals: false,
		if_return: false,
		booleans: false
	}
}
const code = UglifyJS.minify(content, options).code

fs.writeFileSync(path.resolve('./dist/dio.min.js'), code)
