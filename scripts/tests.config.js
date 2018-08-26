import Window from 'jsdom'
import {assert} from 'chai'

var {window} = new Window('<!DOCTYPE html>', {url: 'http://localhost/'})
var {document, location, history} = window

var minify = (value) => {
	return value.replace(/[\n\t]|\s{2,}/g, '')
}
var json = (actual, expected, message) => {
  return assert.equal(JSON.stringify(actual), minify(expected), message)
}
var html = (actual, expected, message) => {
	return assert.equal(actual.innerHTML === undefined ? minify(actual + '') : actual.innerHTML, minify(expected), message)
}

Object.assign(assert, {html, json, trace})
Object.assign(global, {assert, window, document, location, history})
