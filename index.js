const http = require('http')
const {h} = require('./dist/dio.umd.js')

function Bar () {
	return Foo
}

// patchInsert

function Foo () {
	return [
		h('h1', 'Hello'),
		h('h1', 'World')
	]
}

var json = JSON.stringify(h(Bar))
console.log(json)

// console.log(h(Foo)+' - fragment')

// http.createServer(function (request, response) {
//   console.log(response)
// }).listen(2000, () => {
// 	console.log('\nrunning on: http://127.0.0.1:2000');
// })
