import {JSDOM} from 'jsdom'
import {assert} from 'chai'
import {describe, it} from 'mocha'

const {window} = new JSDOM('<!doctype html>')
const {document, location, history, Event} = window

var count = 0
var skips = 0
var stack = null

Object.assign(globalThis, {
  Promise: class promise extends Promise {}
  describe: async (name, callback) => {// console.log('\x1b[31m%s\x1b[0m', 'I am red' ,,, '\x1b[32m%s\x1b[0m', 'I am green');
    if (!stack) Promise.resolve(stack = []).then((stack) => {
      for (var [name, callback] of stack) {
        try {
          await callback(stack = [])
        } catch (error) {
        } finally {
          if (stack.length) console.log('\x1b[32m%s\x1b[0m', name, '\n', stack.join('\n'))
        }
      }
    })
  },
  it: (name, callback) => stack.push([name, callback]),
  assert: {
    equal: (a, b) => console.assert(a === b),
    deep: (a, b) => this.equal(JSON.stringify(a), JSON.stringify(b)),
    html: (a, b) => this.equal(typeof a === 'string' ? a : a.innerHTML || '', b.replace(/[\n\t]|\s{2,}/g, '')),
  }
})

// const describe=(a,b=a)=>b(),assert=(a,b)=>{if(a!=b)console.log(a, b)}
// const timeout=(time,value)=>new Promise(resolve=>{setTimeout(resolve,time | 0,value)})
// const it=(a,b=a)=>b(done),done=it.skip=describe.skip=a=>{};const stack=[];it.only=it,describe.only=describe
// Object.assign(assert,{html:(a,b)=>assert((typeof a=='string'?a:a.innerHTML+'').trim(),(b+'').trim()),equal:(a,b)=>assert(a,b),
// throws:(a)=>{try{console.log(a())}catch(err){}},deepEqual:(a,b)=>assert(JSON.stringify(a),JSON.stringify(b)),doesNotThrow:a=>a()})
// const spyr = (from, key, to = [], fn = err => window.onerror = fn ) => {
//   return ((org) => from[key] = (...args) => { window.onerror = null, from[key] = org, to.push(...args) })(from[key]), to
// };assert.spyr = spyr;const target = document.documentElement;

// import '../tests/Children.js'
// import '../tests/Component.js'
// import '../tests/Element.js'
// import '../tests/Event.js'
// import '../tests/Exception.js'
// import '../tests/Fixture.js'
// import '../tests/Fragment.js'
// import '../tests/Hook.js'
// import '../tests/Interface.js'
// import '../tests/Portal.js'
// import '../tests/Reconcile.js'
// import '../tests/Refs.js'
// import '../tests/Render.js'
// import '../tests/Serialize.js'
// import '../tests/Suspense.js'
// import '../tests/Utility.js'
