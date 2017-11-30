let {JSDOM} = require("jsdom")
let {assert, should, expect} = require('chai')
let {
  document,
  location,
  history,
  addEventListener,
  removeEventListener,
  dispatchEvent,
  Node,
  Document,
  Event
} = (new JSDOM('<!DOCTYPE html>', {url: 'http://localhost/'})).window

let minify = (markup) => {
	return markup.replace(/[\n\t]|\s{2,}/g, '')
}

let html = (actual, expected, message) => {
	return assert.equal(actual.innerHTML === undefined ? actual + '' : actual.innerHTML, minify(expected), message)
}

let json = (actual, expected, message) => {
	return assert.equal(JSON.stringify(actual), minify(expected), message)
}

let trace = (callback, expected, message) => {
  let {createElement, createElementNS, createTextNode} = Document.prototype
  let {appendChild, insertBefore, replaceChild, removeChild} = Node.prototype

  let report = new (class Report {
    constructor() {
      this.length = 0
      this.createElement = 0
      this.createElementNS = 0
      this.createTextNode = 0
      this.appendChild = 0
      this.insertBefore = 0
      this.replaceChild = 0
      this.removeChild = 0
    }
    dispatch(type) {
      ++this[type]
      ++this.length
    }
  })

  Object.assign(Document.prototype, {
    createElement() {
      return (report.dispatch('createElement'), createElement.apply(this, arguments))
    },
    createElementNS() {
      return (report.dispatch('createElementNS'), createElementNS.apply(this, arguments))
    },
    createTextNode() {
      return (report.dispatch('createTextNode'), createTextNode.apply(this, arguments))
    }
  })

  Object.assign(Node.prototype, {
    appendChild() {
      return (report.dispatch('appendChild'), appendChild.apply(this, arguments))
    },
    insertBefore() {
      return (report.dispatch('insertBefore'), insertBefore.apply(this, arguments))
    },
    replaceChild() {
      return (report.dispatch('replaceChild'), replaceChild.apply(this, arguments))
    },
    removeChild() {
      return (report.dispatch('removeChild'), removeChild.apply(this, arguments))
    }
  })

  callback()

  Object.assign(Document.prototype, {createElement, createElementNS, createTextNode})
  Object.assign(Node.prototype, {appendChild, insertBefore, replaceChild, removeChild})

  return assert.deepInclude(report, expected, message)
}

const random = (() => {
  let seed = 4022871197
  let length = 2147483647
  let value = seed % length

  return () => ((value = value * 16807 % length - 1) - 1) / length
})()

const shuffle = (arr) => {
  let array = arr.slice()
  let length = array.length

  while (length) {
    let index = Math.floor(random() * length--)
    let temp = array[length]

    array[length] = array[index]
    array[index] = temp
  }

  return array
}

let nextTick = (callback, tick) => {
  if (tick|0 > 0)
    return setTimeout(() => nextTick(callback, tick - 1), 20)
  else
    return setTimeout(callback, 20)
}

Object.assign(assert, {html, json, trace})
Object.assign(global, require('../../dist/umd.js'))
Object.assign(global, {
  assert,
  expect,
  should,
  shuffle,
  nextTick,
  document,
  location,
  history,
  addEventListener,
  removeEventListener,
  dispatchEvent,
  Node,
  Document,
  Event
})
