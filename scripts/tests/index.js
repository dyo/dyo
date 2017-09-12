const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const {JSDOM} = require("jsdom")
const DOM = new JSDOM('<!DOCTYPE html>')
const search = '.spec.js'
const dirpath = path.resolve(__dirname, '../../tests')
const libpath = path.resolve(__dirname, '../../dist')
const status = {return: false}

global.document = DOM.window.document
global.Node = DOM.window.Node
global.Event = DOM.window.Event

/**
 * @param  {Object} x
 * @param  {Object} y
 * @return {Boolean}
 */
global.deepEqual = (x, y) => {
  const keys = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    keys(x).length === keys(y).length &&
      keys(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y)
}

/**
 * @param  {Node} a
 * @param  {String} b
 * @return {Boolean}
 */
global.compare = (a, b) => {
	return a.innerHTML === b.replace(/\n|\t|\s{2,}/g, '')
}

/**
 * @param  {String} name
 * @param  {Function} body
 */
global.test = (name, body) => {
	const failed = []
	const passed = []
	const underline = '----------------'

	const exit = () => {
		if (!argv('--watch')) {
			process.exit(1)
		}
	}

	const report = (pass, fail) => {
		if (pass === 0 && fail === 0) {
			console.log('/* could not find any tests */')
		}
		
		console.log(underline+'\n'+pass +' assertions passed.\n'+fail+ ' assertions failed.\n')

		if (fail > 0) {
			setTimeout(exit)
		}
	}

	const log = (status, {msg, type}) => {
		switch (status) {
			case 'FAIL':
				console.log('\x1b[31m✖', msg||'', '\x1b[0m')
				break
			case 'PASS':
				console.log('\x1b[32m✓', msg||'', '\x1b[0m')
		}
	}

	const failure = (report) => status.return = (failed.push(report), done)
	const sucess = (report) => passed.push(report)

	const done = () => {
		if (status.return && status.return !== done)
			return

		console.log('\x1b[36m%s', name, '\n'+underline, '\x1b[0m')

		if (failed.length > 0) {
			console.log('Failed Tests')
			failed.forEach((v) => log('FAIL', v))
		}
		if (passed.length > 0) {
			console.log('Passed Tests');
			passed.forEach((v) => log('PASS', v))
		}

		report(passed.length, failed.length)
	}

	const assert = (value, msg) => (value ? sucess : failure)({type: 'ASSERT', msg: msg})
	const equal = (value, expect, msg) => (value === expect ? sucess : failure)({type: 'EQUAL', msg: msg})
	const fail = (msg) => failure({type: 'FAIL', msg})
	const pass = (msg) => failure({type: 'PASS', msg})

	try {
		body({done, assert, equal, deepEqual, fail, pass})
	} catch (err) {
		console.error('\x1b[31m', err, '\x1b[0m')
		console.error('\nError:', name, 'spec')
		failure({type: 'ERR', msg: err})
	}
}

/**
 * @return {}
 */
const argv = (needle) => process.argv.filter((value) => value === needle)

/**
 * @param {string} filepath
 * @return {*}
 */
const load = (filepath) => {
	return require(filepath)
}

/**
 * @return {void}
 */
const factory = (type) => {
	let only = []
	let files = fs.readdirSync(dirpath).filter((file) => {
		if (argv(file).length > 0)
			only.push(file)

		return file.lastIndexOf(search) > -1
	})

	if (only.length > 0) {
		files = files.filter((file) => {
			return only.includes(file)
		})
	}

	Object.assign(global, load(path.join(libpath, 'dio.umd.js')))

	try {
		console.log('\n')

		const specs = files.map((file) => path.join(dirpath, file))[type]((spec) => {
			delete require.cache[require.resolve(spec)]
			require(spec)

			return status.return
		})

	} catch (err) {
		console.error('\x1b[31m', err, '\x1b[0m')
	}
}

/**
 * @param {string} file
 */
const listener = (file) => {
	if (!file)
		console.log('\nwatching..', 'tests')
	else
		console.log('changed > ' + file)

	status.return = false

	factory('some')
}

/**
 * @return {void}
 */
const startup = () => {
	const args = argv('--watch').length
	const watch = args && chokidar.watch([
		dirpath
	], {ignored: /[\/\\]\./})
	
	if (!watch)		
		return factory('map')

	watch.on('ready', listener)
	watch.on('change', listener)
}

startup()
