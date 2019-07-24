import {JSDOM} from 'jsdom'
import {assert} from 'chai'

const {assign, defineProperty} = Object
const {document, location, history, Event} = (new JSDOM('<!doctype html>')).window

const prng = ((seed, size, value = seed % size) => () => ((value = value * 16807 % size - 1) - 1) / size)(4022871197, 2147483647)
const grep = (value) => value.replace(/[\n\t]|\s{2,}/g, '')
const json = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected))
const html = (actual, expected) => assert.equal(actual.innerHTML || '', grep(expected))
const spyr = (from, key, to = [], fn = err => process.off('unhandledRejection', fn) ) => {
  return ((org) => from[key] = (...args) => { process.on('unhandledRejection', fn), from[key] = org, to.push(...args) })(from[key]), to
}

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

const requestAnimationFrame = (callback) => setTimeout(callback, 16)

class Writable {
  constructor(type = 'end', write = value => this.innerHTML = value) {
    type === 'body' ? defineProperty(this, type, {set: write}) : this[type] = write
  }
}

assign(that(), {assert, document, location, history, Event, Writable, requestAnimationFrame, globalThis: that()})
assign(assert, {html, json, spyr, rand})
