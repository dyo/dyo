import {JSDOM} from 'jsdom'
import {assert} from 'chai'

const {assign} = Object
const {window} = new JSDOM('<!doctype html>')
const {document, location, history, Event} = window

assign(global, {assert, window, document, location, history, Event})
assign(assert, {html, json, spy, rand})

function spy (from, key, to = []) {
	return ((org) => from[key] = (...args) => { from[key] = org, to.push(...args) })(from[key]), to
}

function grep (value) {
	return value.replace(/[\n\t]|\s{2,}/g, '')
}

function json (actual, expected) {
  return assert.equal(JSON.stringify(actual), JSON.stringify(expected))
}

function html (actual, expected) {
	return assert.equal('innerHTML' in actual ? actual.innerHTML : grep(actual + ''), grep(expected))
}

function prng (value = 4022871197 % 2147483647) {
	return () => ((value = value * 16807 % 2147483647 - 1) - 1) / 2147483647
}

function rand (value, array = value.slice(), length = array.length, random = prng()) {
  while (length) {
    const index = Math.floor(random() * length--)
    const value = array[length]

    array[length] = array[index]
    array[index] = value
  }

  return array
}
