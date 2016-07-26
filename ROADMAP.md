## Roadmap

### dio.stylesheet({Object})

You can probably create single file components as it stands but there's the problem of css states and pseudo elements.

With this you would be able to do the following.

```javascript
// create a stylesheet
var css = stylesheet({
	'p': {
		'font-size': '22px',
		'color': '#fff',
		'text-decoration': 'underline',
		'width': function () {
			return window.innerWidth + 'px';
		}
	},
	// state
	'p:hover': {
		'color': 'blue'
	},
	// pseudo element
	'p:before': {
		'display': 'block',
		'content': ' '
	}
	// media queries
	'@media...': {
		'p': {...}
	}
	// ... animations etc.
});

// pretty much anything you can do with css
// however one benefit to this is that the 
// amount of bytes you send to the client
// is less compared to i.e a sass/less compiled css
// since it is like sending a source sass file to the client
// rather than a compiled one.

// here i render the stylesheet with namespaces body and .app
css(['body', '.app']);

// this will render a stylesheet with the following content:
// body p, .app p {...} body p:before, .app p:before {...}

// re-render/update : preserves the previous namespaces
css();
// removes the stylesheet from the page
css.remove();


// alter the css object and render
css(function (object) {
	object['p']['font-size'] = '50px';
});

// simple clone
// performs a deep clone of the css object
var css2 = css.clone();

// will render another stylesheet to the head
css2();

// clone and modifiy
// clones the css object
// but also allows for altering the new cloned version
// before assigning it to the variable
var css3 = css.clone(function (object) {
	object['p']['font-size'] = '2000px';
});

// renders new stylesheet similar to css() difference
// in p {font-size: 50px} -> p { font-size: 2000px }
css3();

// passing a string will render the stylesheet to that element
css3('.container');
// at the moment this will have side effects if you say render a stylesheet
css('head')
css('.app')
// when you try to remove the stylesheet
css.remove()
// it will only remove it from the last passed element
// in this caase '.app'
```
At the moment it stands alone, but could be intergrated into a components schema.

The code that will make this is:


```javascript
function clone (from, to)
{
    if (from == __null || typeof from != "object") {
    	return from;
    }

    if (!is(from, __object) && !is(from, __array)) {
    	return from;
    }
    else {
    	return new from[__constructor](from);
    }

    to = to || new from[__constructor]();

    for (var name in from) {
        to[name] = typeof to[name] == "undefined" ? clone(from[name], __null) : to[name];
    }

    return to;
}

function stylesheet (store) {
	var
	style,
	prefix,
	element = 'head';

	function getStyleContent () {
		var
		str = [];

		each(store, function (object, selector) {
			var 
			arr = [];

			if (prefix) {
				selector = prefix.map(function (prefix) {
					return prefix + ' ' + selector;
				});
				selector = selector.join(',');
			}

			each(object, function (value, name) {
				value = is(value, __function) ? value() : value;
				value = value === ' ' ? '" "' : value;

				arr.push(name + ':' + value)
			});

			str.push(selector + '{' + arr.join(';') + '}');
		});

		return str.join('');
	}

	function mount () {
		return element.nodeType ? element : __document.querySelector(element);
	}

	function createStyleElement () {
	  	style = __document.createElement('style');
	    style.type = 'text/css';
	}

	function appendStyleElement (content) {
		content = createTextNode(content);

		style.appendChild(content);
		mount().appendChild(style);

		return content;
	}

	function removeStyleElement () {
		mount().removeChild(style);
	}

	function createTextNode (content) {
		return __document.createTextNode(content)
	}

	function replaceStyleContent (content) {
		style.textContent = content;
		return style;
	}

	function sheet (arg) {
		if (is(arg, __string)) {
			element = arg;
		}

		if (is(arg, __array)) {
			prefix = arg;
		}
		else if (is(arg, __function)) {
			arg(store);
			return replaceStyleContent(getStyleContent());
		}

		if (!style) {
			createStyleElement();
			appendStyleElement(getStyleContent());
		}
		else {
			return replaceStyleContent(getStyleContent())
		}
	}

	sheet.remove = function () {
		removeStyleElement();
	}

	sheet.clone = function (fn) {
		var 
		clonedStore = clone(store);

		fn(clonedStore);
		return stylesheet(clonedStore);
	}

	return sheet;
}

```

or another route that involves the following

```javascript
function Foo () {
	var css = dio.stylesheet({'p': {'color': 'red'}});

	css() 
	// calling css() will return  a component that
	// that is a <style></style> element
	// with it's text content as the css defined above
	// this component will however have a shoudComponentUpdate
	// method that always returns false
	// this ensures that this component is ever only updated/added
	// on the initial mount and never touch again.
	// this component is also optimized to use the 
	// compiled {type: '', props: {}, children: ''} hyperscript object
	// rather than h('')...

	return {
		render: function () {
			return h('Foo'
						'Content',
						css()
					)
		}
	}
}
```