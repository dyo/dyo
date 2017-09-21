!function () {
	var selector = 'code'
	var comments = 'comment'
	var keys = 'key'
	var newline = 'newline'
	var words = 'word'
	var number = 'number'
	var operators = 'operator'
	var regex = 'regex'
	var space = 'space'
	var string = 'string'
	var unknown = 'unknown'
	var prefix = 'syntax-'

	var tokens = [
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
	]
	
	var keywords = '^(\
		a(bstract|lias|nd|rguments|rray|s(m|sert)?|uto)|\
		b(ase|egin|ool(ean)?|reak|yte)|\
		c(ase|atch|har|hecked|lass|lone|ompl|onst|ontinue)|\
		document|\
		de(bugger|cimal|clare|f(ault|er)?|\
		init|l(egate|ete)?)|\
		do|double|\
		e(cho|ls?if|lse(if)?|nd|nsure|num|vent|x(cept|ec|p(licit|ort)|te(nds|nsion|rn)))|\
		f(allthrough|alse|inal(ly)?|ixed|loat|or(each)?|riend|rom|unc(tion)?)|\
		global|goto|guard|\
		i(f|mp(lements|licit|ort)|n(it|clude(_once)?|line|out|stanceof|t(erface|ernal)?)?|s)|\
		l(ambda|et|ock|ong)|m(odule|utable)|\
		NaN|\
		n(amespace|ative|ext|ew|il|ot|ull)|\
		o(bject|perator|r|ut|verride)|\
		p(ackage|arams|rivate|rotected|rotocol|ublic)|\
		r(aise|e(adonly|do|f|gister|peat|quire(_once)?|scue|strict|try|turn))|\
		s(byte|ealed|elf|hort|igned|izeof|tatic|tring|truct|ubscript|uper|ynchronized|witch)|\
		t(emplate|hen|his|hrows?|ransient|rue|ry|ype(alias|def|id|name|of))|\
		u(n(checked|def(ined)?|\ion|less|signed|til)|se|sing)|\
		v(ar|irtual|oid|olatile)|\
		w(char_t|hen|here|hile|ith)|xor|yield\
	)$'.replace(/\s/g, '')

	var regex = new RegExp(keywords, 'g')
	var font = selector + '{font:0.9em/1.618 Consolas, "Liberation Mono", Menlo, Courier, monospace;tab-size:2;}'
	var style = [
		'.syntax-word{color:#444}',
		'.syntax-operator{color:#444}',
		'.syntax-number{color:#1C00CF}',
		'.syntax-regex{color:#C41A16}',
		'.syntax-key{color:#AA0C91}',
		'.syntax-string{color:#C41A16}',
		'.syntax-comment{color:#007400}',
		font
	]
	
	var tokenize = function (text) {
		var stack = []
		var split = false

		while (text) {
			for (var i = 0; i < tokens.length; ++i) {
				var matches, type, value

				if (!(matches = tokens[i][1].exec(text)) || matches.index !== 0)
					continue

				if ((type = tokens[i][0]) === regex && split)
					continue

				if (regex.test((value = matches[0])) && type === words) 
					type = keys

				if (type !== space) 
					split = type === number || type === words

				text = text.slice(value.length)
				stack.push([type, value])

				break
			}
		}

		return stack
	}

	var collection = [].slice.call(document.querySelectorAll(selector))

	collection.forEach(function (node) {
		var stack = tokenize(node.textContent.trim())
		
		node.textContent = ''

		stack.forEach(function (type) {
			var span = document.createElement('span')
			span.className = prefix + type[0]
			span.textContent = type[1]
			node.appendChild(span)
		})
	})

	document.head.appendChild(document.createElement('style')).textContent = style.join('')
}()

!function () {
	[].slice.call(document.querySelectorAll('h1,h2')).forEach(function (node) {
		if (!node.id)
			return

		node.innerHTML = '<a href=#'+node.id+'>'+node.textContent+'</a>'
	})
}()
