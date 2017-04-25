(function (){
	var selector = 'code';
	var comments = 'comment';
	var keys = 'key';
	var newline = 'newline';
	var words = 'word';
	var number = 'number';
	var operators = 'operator';
	var regex = 'regex';
	var space = 'space';
	var string = 'string';
	var unknown = 'unknown';
	var prefix = 'syntax-';
	var styleId = 'highlight-style';

	var RESERVED_KEYS = /^(a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|b(ase|egin|ool(ean)?|reak|yte)|c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|document|de(bugger|cimal|clare|f(ault|er)?|init|l(egate|ete)?)|do|double|e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|global|goto|guard|i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|l(ambda|et|ock|ong)|m(odule|utable)|NaN|n(amespace|ative|ext|ew|il|ot|ull)|o(bject|perator|r|ut|verride)|p(ackage|arams|rivate|rotected|rotocol|ublic)|r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|u(n(checked|def(ined)?|ion|less|signed|til)|se|sing)|v(ar|irtual|oid|olatile)|w(char_t|hen|here|hile|ith)|xor|yield)$/;
	var RESERVED_TOKENS = [
		[number, /#[0-9a-f]{6}\b/],
		[number, /#[0-9a-f]{3}\b/],
		[comments, /\/\/.*?(?=\n|$)/],
		[comments, /#.*?(?=\n|$)/],
		[comments, /\/\*[\s\S]*?\*\//],
		[comments, /<!--[\s\S]*?-->/],
		[regex, /\/(\\\/|[^\/\n])*\//],
		[string, /'(\\'|[^'\n])*'/],
		[string, /"(\\"|[^"\n])*"/],
		[string, /`(\\`|[^`\n])*`/],
		[number, /[+-]?([0-9]*\.?[0-9]+|[0-9]+\.?[0-9]*)([eE][+-]?[0-9]+)?/],
		[operators, /[\\.,:;+\-*\/=<>()[\]{}|?!&@~]/],
		[newline, /\n/],
		[space, /[^\S\n]+/],
		[words, /[\w$]+/],
		[unknown, /./]
	];

	var styleContent = [
		'word{color:#444',
		'operator{color:#444',
		'number{color:#1C00CF',
		'regex{color:#C41A16',
		'key{color:#AA0C91',
		'string{color:#C41A16',
		'comment{color:#007400'
	]
	.map(function (value) { return '.' + prefix + value + ';}' })
	.join('') + selector + '{font:0.9em/1.618 Consolas, "Liberation Mono", Menlo, Courier, monospace;tab-size:2;}';

	style = document.createElement('style');
	style.textContent = styleContent;
	style.id = styleId;

	function tokenize (text) {
		var tokens = [];
		var length = RESERVED_TOKENS.length;
		var forceDiv = false;
		var className;
		var token;
		var matches;

		while (text) {
			for (var index = 0; index < length; index += 1) {
				matches = RESERVED_TOKENS[index][1].exec(text);

				if (!matches || matches.index !== 0) continue;

				className = RESERVED_TOKENS[index][0];

				if (className === regex && forceDiv) continue;

				token = matches[0];

				if (className === words && RESERVED_KEYS.test(token)) className = keys;
				if (className !== space) forceDiv = className === number || className === words;

				text = text.slice(token.length);
				tokens.push([className, token]);
				break;
			}
		}

		return tokens;
	}

	function highlighter (element) {
		var tokens = tokenize(element.textContent.trim());
		element.innerHTML = '';

		tokens.forEach(function (token) {
			var tokenElement = document.createElement('span');
			tokenElement.className = prefix + token[0];
			tokenElement.textContent = token[1];
			element.appendChild(tokenElement);
		});
	}


	function highlight () {
		if (!document.getElementById(styleId)) {
			document.head.appendChild(style);
		}

		Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (element) {
			highlighter(element);
		});
	}

	window.highlight = highlight;
}());
