/**
 * ---------------------------------------------------------------------------------
 * 
 * stylesheet
 * 
 * ---------------------------------------------------------------------------------
 */


/**
 * stylesheet
 * 
 * @param  {(Node|null)}   element
 * @param  {function}      component
 * @return {(string|void)}
 */
function stylesheet (element, component) {
	var id   = '';
	var css  = '';
	var func = typeof component.stylesheet === 'function';

	// create stylesheet, executed once per component constructor(not instance)
	if (func) {
		// generate unique id
		id = component.name + random(6);

		// property id, selector id 
		var prefix      = '['+nsstyle+'='+id+']';
		var currentLine = '';
        
        var content = (
            // retrieve css string and format...
            component.stylesheet()
                // remove all spaces after `:`
                .replace(/:[ \t]+/g, ':')

                // remove all spaces before `;`
                .replace(/[ \t]+;/g, ';')
                
                // drop every block and property into newlines
                .replace(/(\{|\}|;)(?!\n)/g, '$1\n')

                // remove all leading spaces and newlines                
                .replace(/^[\t\n ]*/gm, '')

                // remove all spaces/tabs after opening `{` and closing `}` tags
                .replace(/(\{|\})[ \t]+/g, '$1')

                // remove all spaces/tabs before opening `{` and closing `}` tags
                .replace(/[ \t]+(\{|\})/g, '$1')
                
                // remove all trailing spaces and tabs
                .replace(/[ \t]+$/gm, '')

                // insure opening `{` are on the same like as the selector
                .replace(/(.*)\n(?:|[\t\n ])\{/g, '$1{')

                // patch declarations ending without ;
                .replace(/([^\{\};\n\/]$)/gm, '$1;')
        );

		var characters = input(content);

		// css parser, SASS &{} is supported, styles are namespaced,
		// appearance, transform, animation & keyframes are prefixed,
		// keyframes and corrosponding animations are also namespaced
        while (!characters.eof()) {
        	var character     = characters.next();
        	var characterCode = character.charCodeAt(0);

        	// end of current line, \n
        	if (characterCode === 10) {
        		var firstLetter = currentLine.charCodeAt(0);

        		// `@` character
        		if (firstLetter === 64) {
        			// @keyframe, `k` character
        			if (currentLine.charCodeAt(1) === 107) {
        				currentLine = currentLine.substr(1, 10) + id + currentLine.substr(11);

        				// till the end of the keyframe block
        				while (!characters.eof()) {
        					var char = characters.next();
        					var charCode = char.charCodeAt(0);
        					
        					// `\n` character
        					if (charCode !== 10) {
        						currentLine += char;

                                var timetravel = characters.look(2);

        						// `}`, `}` characters
        						if (charCode === 125 && timetravel && timetravel.charCodeAt(0) === 125) {
        							currentLine += ''; break;
        						}
        					}
        				}

        				// add prefix, webkit is the only reasonable prefix to use here
        				// -moz- has supported this since 2012 and -ms- was never a thing here
        				currentLine = '@-webkit-'+currentLine+'}@'+currentLine;
        			}

                    // do nothing to @media...
        		} else {
        			// animation: `a`, `n`, `n` characters
        			if (
        				firstLetter === 97 && 
        				currentLine.charCodeAt(1) === 110 && 
        				currentLine.charCodeAt(8) === 110
    				) {
        				// remove space after `,` and `:`
        				currentLine = currentLine.replace(/, /g, ',').replace(/: /g, ':');

        				var splitLine = currentLine.split(':');

        				// re-build line
        				currentLine = (
        					splitLine[0] + ':' + id + (splitLine[1].split(',')).join(','+id)
    					);

                        // add prefix, same as before webkit is the only reasonable prefix
                        // for older andriod phones
        				currentLine = '-webkit-' + currentLine + currentLine;
        			} else if (
        				// `t`, `r`, `:`, characters
        				(
        					firstLetter === 116 && 
        					currentLine.charCodeAt(1) === 114 && 
        					currentLine.charCodeAt(9) === 58
    					) 
        					||
        				// `a`, `p`, `:`, characters
        				(
        					firstLetter === 97 && 
        					currentLine.charCodeAt(1) === 112 && 
        					currentLine.charCodeAt(10) === 58
    					)
    				) {
        				// transform/appearance
                        // the above if condition assumes the length and placement
                        // of the 3 characters listed to pass the condition
        				currentLine = '-webkit-' + currentLine + currentLine;
        			} else {
        				// selector declaration, if last char is `{`
                        // note: the format block made it so that this will always
                        // be the case for selector declarations
        				if (currentLine.charCodeAt(currentLine.length - 1) === 123) {
        					var splitLine         = currentLine.split(',');
        					var currentLineBuffer = '';

                            // iterate through all the characters and build
                            // this allows us to prefix multiple selectors with namesapces
                            // i.e h1, h2, h3 --> [namespace] h1, ....
        					for (var i = 0, length = splitLine.length; i < length; i++) {
        						var selector = splitLine[i],
        							first    = selector.charCodeAt(0),
        							affix    = '';

                                // if first selector
    							if (i === 0) {
    								// `:`, `&`, characters
    								affix = (first === 58 || first === 38) ? prefix : prefix + ' ';
    							} else {
                                    affix = ',' + prefix;
                                }

        						if (first === 123) {
        							// `{`, character
        							currentLineBuffer += affix + selector;
        						} else if (first === 38) { 
        							// `&` character
        							currentLineBuffer += affix + selector.substr(1);
        						} else {
        							currentLineBuffer += affix + selector;
        						}
        					}

        					currentLine = currentLineBuffer;
        				}
        			}
        		}

        		css += currentLine;
        		currentLine = '';
        	} else {
                // `/` character
                if (characterCode === 47) {
                    var nextCharaterCode = characters.peek().charCodeAt(0);

                    // `/`, `/` characters
                    if (nextCharaterCode === 47) {
                        // till end of line comment 
                        characters.sleep('\n');
                    } else if (nextCharaterCode === 42) {
                        characters.next();

                        // `/`, `*` character
                        while (!characters.eof()) {
                            // till end of block comment
                            if (
                                // `*`, `/` character
                                characters.next().charCodeAt(0)  === 42 && 
                                characters.peek().charCodeAt(0) === 47
                            ) {
                                characters.next(); break;
                            }
                        }
                    } else {
                        currentLine += character;
                    }
                } else {
                    currentLine += character;
                }
        	}
        }

        // signifies that we are done parsing the components css
        // so we can avoid this whole step for any other instances
        component.stylesheet = 0;

        component.id = id;
        component.css = css;
	} else {
		// retrieve cache
		id = component.id;
		css = component.css;
	}

    if (element == null) {
    	// cache for server-side rendering
    	return component.css = '<style id="'+id+'">'+css+'</style>';
    } else {
    	element.setAttribute(nsstyle, id);

    	// create style element and append to head
    	// only when stylesheet is a function
    	// this insures we will only ever excute this once 
    	// since we mutate the .stylesheet property to 0
    	if (func) {
    		// avoid adding a style element when one is already present
    		if (document.querySelector('style#'+id) == null) {
	    		var style = document.createElement('style');
	    		
                style.textContent = css;
    			style.id = id;

				document.head.appendChild(style);
    		}
    	}
    }
}

