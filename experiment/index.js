var http = require('http');
var fs = require('fs');
var dio = require('./dist/dio.js');

http.createServer(function (request, response) {
	const webpage = (
		h('!doctype',
	  	h('head',
	  		h('title', 'Title!'),
	  		h('style', `h1 {color:red;}`),
	  		h('script', `console.log('Hello')`)
	  	),
	  	h('body',
	  		h('h1', 'Hello World')
			)
		)
	);

	// render to string
	// response.end(`${webpage}`)
	// json responses
  // dio.render({json: true}, response)
  // render to stream
  dio.render(webpage, response)
  // dio.stream(webpage).pipe(response)
}).listen(2000, () => {
	console.log('\nrunning on: http://127.0.0.1:2000');
});
