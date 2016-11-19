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
		var prefix      = '['+styleNS+'='+id+']';
		var currentLine = '';

        // TODO
        var start = performance.now();
        
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

        		// `@`
        		if (firstLetter === 64) {
        			// @keyframe, `k`
        			if (currentLine.charCodeAt(1) === 107) {
        				currentLine = currentLine.substr(1, 10) + id + currentLine.substr(11);

        				// till the end of the keyframe block
        				while (!characters.eof()) {
        					var char = characters.next();
        					var charCode = char.charCodeAt(0);
        					
        					// \n
        					if (charCode !== 10) {
        						currentLine += char;

                                var timetravel = characters.look(2);

        						// `}`, `}`
        						if (charCode === 125 && timetravel && timetravel.charCodeAt(0) === 125) {
        							currentLine += '';
        							break;
        						}
        					}
        				}

        				// prefix, webkit is the only reasonable prefix to use here
        				// -moz- has supported this since 2012 and -ms- was never a thing here
        				currentLine = '@-webkit-'+currentLine+'}@'+currentLine;
        			}

                    // do nothing to @media
        		} else {
        			// animation: a, n, n
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

        				currentLine = '-webkit-' + currentLine + currentLine;
        			} else if (
        				// t, r, :
        				(
        					firstLetter === 116 && 
        					currentLine.charCodeAt(1) === 114 && 
        					currentLine.charCodeAt(9) === 58
    					) 
        					||
        				// a, p, :
        				(
        					firstLetter === 97 && 
        					currentLine.charCodeAt(1) === 112 && 
        					currentLine.charCodeAt(10) === 58
    					)
    				) {
        				// transform/appearance
        				currentLine = '-webkit-' + currentLine + currentLine;
        			} else {
        				// selector declaration, if last char is `{`
        				if (currentLine.charCodeAt(currentLine.length - 1) === 123) {
        					var splitLine         = currentLine.split(',');
        					var currentLineBuffer = '';

        					for (var i = 0, length = splitLine.length; i < length; i++) {
        						var selector = splitLine[i],
        							first    = selector.charCodeAt(0),
        							affix    = '';

    							if (i === 0) {
    								// :, &
    								affix = (first === 58 || first === 38) ? prefix : prefix + ' ';
    							} else {
                                    affix = ',' + prefix;
                                }

        						if (first === 123) {
        							// `{`
        							currentLineBuffer += affix + selector;
        						} else if (first === 38) { 
        							// `&`
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
                // `/`
                if (characterCode === 47) {
                    var nextCharaterCode = characters.peek().charCodeAt(0);

                    // `/`, `/`
                    if (nextCharaterCode === 47) {
                        // till end of line comment 
                        characters.sleep('\n');
                    } else if (nextCharaterCode === 42) {
                        characters.next();

                        // `/`, `*`
                        while (!characters.eof()) {
                            // till end of block comment
                            if (
                                // `*`, `/`
                                characters.next().charCodeAt(0)  === 42 && 
                                characters.peek().charCodeAt(0) === 47
                            ) {
                                characters.next();
                                break;
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

        console.log(performance.now()-start, css);

        component.css        = css;
        component.stylesheet = 0;
        component.id         = id;
	} else {
		// retrieve cache
		id  = component.id;
		css = component.css;
	}

    if (element == null) {
    	// cache for server-side rendering
    	return component.css = '<style id="'+id+'">'+css+'</style>';
    } else {
    	element.setAttribute(styleNS, id);

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

