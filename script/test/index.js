let {JSDOM} = require("jsdom")
let {assert, should, expect} = require('chai')
let {document, Event} = (new JSDOM('<!DOCTYPE html>')).window

let minify = (str) => {
	return str.replace(/[\n\t]|\s{2,}/g, '')
}

let html = (obj, str, msg) => {
	return assert.equal(obj.innerHTML === undefined ? obj + '': obj.innerHTML, minify(str), msg)
}

let json = (obj, str, msg) => {
	return assert.equal(JSON.stringify(obj), minify(str), msg)
}

let nextTick = (callback, tick) => {
	if (tick|0 > 0)
		return setTimeout(() => nextTick(callback, tick - 1), 20)
	else
		return setTimeout(callback, 20)
}

Object.assign(assert, {html, json})
Object.assign(global, {assert, expect, should, document, Event, nextTick})
Object.assign(global, require('../../dist/dio.umd.js'))
