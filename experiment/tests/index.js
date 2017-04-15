const vm = require('vm');
const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname);
const current = path.basename(__filename);
const shared = fs.readFileSync(path.join(__dirname, '../src/Shared.js'), 'utf8');
const regex = /(\s*)import\s+'(.*)'.*/g;

const resolve = (file, dir) => {
	const name = file.indexOf('.spec') > 0 ? file.substring(0, file.lastIndexOf('.spec')) : file;
	return path.resolve(__dirname, dir, name.replace('.js', '')+'.js')
}

const imports = (match, tabs, file) => {
	return fs.readFileSync(path.join(resolve(file, '../src/')), 'utf8');
}

files.forEach(file => {
	if (file === current) {
		return;
	}
	const filepath = path.join(__dirname, file);
  const code = fs.readFileSync(filepath, 'utf8').replace(regex, imports);
  const related = fs.readFileSync(resolve(file, '../src/'), 'utf8');

  vm.runInThisContext(test.toString()+shared+related+code, filepath);
});

function test (name, body) {
	const failed = [];
	const passed = [];

	const report = (pass, fail) => {
		console.log(pass +' tests passed, '+fail+ ' tests failed.\n');
		if (fail > 0) {
			process.exit(1);
		}
	}
	const log = (status, {msg, type}) => {
		switch (status) {
			case 'FAIL': {
				console.log('\x1b[31m', ' '+type, ': ', msg||'', '\x1b[0m');
				break;
			}
			case 'PASS': {
				console.log('\x1b[32m', ' '+type, ': ', msg||'', '\x1b[0m');
				break;
			}
		}
	}
	const end = () => {
		console.log('\x1b[4m\x1b[36m%s\x1b[0m', '\n'+'\x1b[1m'+name+'\x1b[0m');
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
		(actual === expected ? passed : failed).push({type:'EQUAL', msg:msg})
	}

	body({end, ok, equal});
}
