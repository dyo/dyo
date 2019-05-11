import * as Utility from './Utility.js'

// static values
export var key = -(-1 >>> 0)
export var identifier = Utility.symbol('identifier')

// timestamps(ms)
export var timeout = 100
export var network = timeout * 6

// element identifiers
export var thenable = 1
export var iterable = 2
export var component = 3
export var target = 4
export var portal = 5
export var element = 6
export var text = 7
export var empty = 8

// dispatch identifiers
export var props = 11
export var mount = 12
export var unmount = 13
export var content = 14
export var callback = 15

// schedule identifiers
export var respond = 0
export var request = 1

// container types
export var fragment = null
export var offscreen = 'noscript'
