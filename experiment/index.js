var http = require('http');
var fs = require('fs');
var dio = require('./dist/dio.js');

http.createServer(function (request, response) {
	const page = (
		h('!doctype', {html: true},
	  	h('head',
	  		h('title', 'Title!'),
	  		h('style', `h1 {color:red;}`),
	  		h('script', {defer: true, innerHTML: `console.log(1)`})
	  	),
	  	h('body',
	  		h('h1', 'Hello World')
			)
		)
	);

	// render to string
	// response.end(`${page}`)
	// json responses
  // dio.render({json: true}, response)
  // render to stream
  dio.render(page, response)
  // dio.stream(page).pipe(response)
}).listen(2000, () => {
	console.log('\nrunning on: http://127.0.0.1:2000');
});
