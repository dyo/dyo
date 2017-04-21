const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const dio = require('../dist/dio');
const jsdom = require("jsdom").jsdom;

global.document = jsdom();
global.window = document.defaultView;

/**
 * deepEqual
 *
 * @param  {Object} x
 * @param  {Object} y
 * @return {Boolean}
 */
global.deepEqual = (x, y) => {
  const ok = Object.keys, tx = typeof x, ty = typeof y;
  return x && y && tx === 'object' && tx === ty ? (
    ok(x).length === ok(y).length &&
      ok(x).every(key => deepEqual(x[key], y[key]))
  ) : (x === y);
}

/**
 * Test
 * @param  {String} name
 * @param  {Function} body
 */
global.test = (name, body) => {
	const failed = [];
	const passed = [];

	let ended = false;

	const sync = (body) => {
		return !body.toString().match(/async|await|Promise|setTimeout|\bend\b|\.then/g);
	}

	const report = (pass, fail) => {
		if (pass === 0 && fail === 0) {
			console.log('/* could not find any tests */')
		}
		console.log(underline+'\n'+pass +' assertions passed.\n'+fail+ ' assertions failed.\n');
		if (fail > 0) {
			setTimeout(exit);
		}
	}
	const log = (status, {msg, type}) => {
		switch (status) {
			case 'FAIL': {
				console.log('\x1b[31m', type+': ✖', msg||'', '\x1b[0m');
				break;
			}
			case 'PASS': {
				console.log('\x1b[32m', type+': ✓', msg||'', '\x1b[0m');
				break;
			}
		}
	}

	const underline = '----------------';

	const end = () => {
		ended = true;
		console.log(
			'\x1b[36m%s',
			name,
			'\n'+underline,
			'\x1b[0m'
		);
		if (failed.length > 0) {
			console.log('Failed Tests');
			failed.forEach((v) => log('FAIL', v))
		}
		if (passed.length > 0) {
			console.log('Passed Tests');
			passed.forEach((v) => log('PASS', v));
		}
		report(passed.length, failed.length);
	}

	const ok = (value, msg) => {
		(value ? passed : failed).push({type: 'OK', msg: msg});
	}

	const equal = (actual, expected, msg) => {
		(actual === expected ? passed : failed).push({type: 'EQUAL', msg: msg})
	}

	try {
		body({end, ok, equal, deepEqual});
	} catch (err) {
		err = err.stack.split('\n').slice(0, 4).join('\n');
		err = err.replace(new RegExp('.*'+__dirname+'(.*)', 'g'), '$1').replace(/\)/g, '');

		failed.push({
			type: 'ERR',
			msg: err
		});
	}

	if (!ended && sync(body)) {
		end();
	}
}

const files = fs.readdirSync(__dirname).filter(file=>file.lastIndexOf('.spec.js') > 0);
const specs = files.map(file=>path.resolve(__dirname, file));

const bootstrap = () => {
	specs.forEach((spec)=>{
		delete require.cache[require.resolve(spec)];
	});

	process.stdout.write('\033c');
	process.stdout.write("\033]0;" + 'dio test' + '\007');

	specs.map(spec=>require(spec)).map(spec=>typeof spec === 'function' ? spec(dio) : spec);
}

const exit = () => {
	if (type.indexOf('--watch') === -1) {
		process.exit(1);
	}
}

const type = process.argv.pop() + '';

if (type.indexOf('--watch') !== -1) {
	const watcher = (file) => {
		if (!file) {
			console.log('\nwatching..', 'tests/');
		} else {
			console.log('changed > ' + file);
		}
		bootstrap();
	}

	const watch = chokidar.watch(specs, {ignored: /[\/\\]\./});

	watch.on('change', watcher);
	watch.on('ready', watcher);
}

bootstrap();
