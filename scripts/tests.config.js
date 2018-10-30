import {JSDOM} from 'jsdom'
import {assert} from 'chai'

const {window} = new JSDOM('<!doctype html>')
const {document, location, history, Event} = window
const {assign} = Object

const prng = ((seed, size, value = seed % size) => () => ((value = value * 16807 % size - 1) - 1) / size)(4022871197, 2147483647)
const spyr = (from, key, to = []) => (((org) => from[key] = (...args) => { from[key] = org, to.push(...args) })(from[key]), to)
const grep = (value) => value.replace(/[\n\t]|\s{2,}/g, '')
const json = (actual, expected) => assert.equal(JSON.stringify(actual), JSON.stringify(expected))
const html = (actual, expected) => assert.equal('innerHTML' in actual ? actual.innerHTML : grep(actual + ''), grep(expected))

const rand = (value, array = value.slice(), length = array.length, index = 0) => {
  while (length) {
    index = Math.floor(prng() * length)
    value = array[--length]
    array[length] = array[index]
    array[index] = value
  }
  return array
}

assign(global, {assert, window, document, location, history, Event})
assign(assert, {html, json, spyr, rand})
