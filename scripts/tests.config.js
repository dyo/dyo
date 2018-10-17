import {JSDOM} from 'jsdom'
import {assert} from 'chai'

const {window} = new JSDOM('<!doctype html>')
const {document, location, history, Event} = window

function minify (value) {
	return value.replace(/[\n\t]|\s{2,}/g, '')
}

function json (actual, expected, message) {
  return assert.equal(JSON.stringify(actual), minify(expected), message)
}

function html (actual, expected, message) {
	return assert.equal(actual.innerHTML === undefined ? minify(actual + '') : actual.innerHTML, minify(expected), message)
}

Object.assign(assert, {html, json})
Object.assign(global, {assert, window, document, location, history, Event})
