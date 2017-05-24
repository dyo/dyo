const http = require('http');
const dio = require('../../dio.js');

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

	// render string
	// response.end(`${webpage}`)

	// render json responses
  // dio.render({json: true}, response)

  // streams
  // dio.stream(webpage).pipe(response)

  // stream to response
  dio.render(webpage, response)
}).listen(2000, () => {
	console.log('\nrunning on: http://127.0.0.1:2000');
});
