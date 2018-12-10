import {JSDOM} from 'jsdom'
import {assert} from 'chai'

const {assign} = Object
const {document, location, history, Event} = (new JSDOM('<!doctype html>')).window

const prng = ((seed, size, value = seed % size) => () => ((value = value * 16807 % size - 1) - 1) / size)(4022871197, 2147483647)
const spyr = (from, key, to = []) => (((org) => from[key] = (...args) => { from[key] = org, to.push(...args) })(from[key]), to)
const grep = (value) => value.replace(/[\n\t]|\s{2,}/g, '')
const json = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected))
const html = (actual, expected) => assert.equal(actual.innerHTML || '', grep(expected))

const that = () => typeof globalThis == 'object' ? globalThis :
	typeof global == 'object' ? global :
		typeof window == 'object' ? window :
			typeof self == 'object' ? self : Function('return this')()

const rand = (value, array = value.slice(), length = array.length, index = 0) => {
  while (length) {
    index = Math.floor(prng() * length)
    value = array[--length]
    array[length] = array[index]
    array[index] = value
  }
  return array
}

class Writable {
  end(value) { this.innerHTML = value }
}

assign(that(), {assert, document, location, history, Event, globalThis: that(), Writable: Writable})
assign(assert, {html, json, spyr, rand})

