import {JSDOM} from 'jsdom'
import {assert} from 'chai'

const {assign} = Object
const {window} = new JSDOM('<!doctype html>')
const {document, location, history, Event} = window

assign(global, {assert, window, document, location, history, Event})
assign(assert, {html, json, spy})

function spy (from, key, to = []) {
	return ((org) => from[key] = (...args) => { from[key] = org, to.push(...args) })(from[key]), to
}

function grep (value) {
	return value.replace(/[\n\t]|\s{2,}/g, '')
}

function json (actual, expected, message) {
  return assert.equal(JSON.stringify(actual), grep(expected), message)
}

function html (actual, expected, message) {
	return assert.equal('innerHTML' in actual ? actual.innerHTML : grep(actual + ''), grep(expected), message)
}
