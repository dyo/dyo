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
	var id     = '';
	var output = '';
	var func   = typeof component.stylesheet === 'function';

	// create stylesheet, executed once per component constructor(not instance)
	if (func) {
		// generate unique id
		id = component.name + random(6);

		// property id, selector id 
		var prefix      = '['+styleNS+'='+id+']';
		var currentLine = '';
        var raw         = component.stylesheet();
        var content     = raw
            .replace(/\t/g, '')             // remove tabs
            .replace(/: /g, ':')            // remove space after `:`
            .replace(/{(?!\n| \n)/g, '{\n') // drop every opening block into newlines
            .replace(/;(?!\n| \n)/g, ';\n') // drop every property into newlines
            .replace(/^ +|^\n/gm, '');      // remove all leading spaces and newlines

		var characters  = input(content);

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

        						// `}`, `}`
        						if (charCode === 125 && characters.look(2).charCodeAt(0) === 125) {
        							currentLine += '';
        							break;
        						}
        					}
        				}

        				// prefix, webkit is the only reasonable prefix to use here
        				// -moz- has supported this since 2012 and -ms- was never a thing here
        				currentLine = '@-webkit-'+currentLine+'}@'+currentLine;
        			}
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
        				currentLine = '-webkit-'+currentLine+currentLine;
        			} else if (
        				// t, r, :
        				(
        					firstLetter === 116 && 
        					currentLine.charCodeAt(0) === 114 && 
        					currentLine.charCodeAt(9) === 58
    					) 
        					||
        				// a, p, :
        				(
        					firstLetter === 97 && 
        					currentLine.charCodeAt(0) === 112 && 
        					currentLine.charCodeAt(10) === 58
    					)
    				) {
        				// transform/appearance:
        				currentLine = '-webkit-' + currentLine + currentLine;
        			} else {
        				// selector declaration
        				if (currentLine.charCodeAt(currentLine.length - 1) === 123) {
        					var splitLine         = currentLine.split(',');
        					var currentLineBuffer = '';

        					for (var i = 0, length = splitLine.length; i < length; i++) {
        						var selector = splitLine[i],
        							first    = selector.charCodeAt(0),
        							affix    = '';

        							if (i === 0) {
        								// :, &
        								affix = first === 58 || first === 38 ? prefix : prefix +' ';
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

        		output += currentLine;
        		currentLine = '';
        	} else {
        		var nextCharater = characters.look(1).charCodeAt(0);

        		// `/`, `/`
        		if (characterCode === 47 && nextCharater === 47) {
        			// till end of line comment 
        			characters.sleep('\n');
        		} else if (characterCode === 47 && nextCharater === 42) {
        			// `/`, `*`
        			while (!characters.eof()) {
        				// till end of block comment
        				if (
        					// `*`, `/`
        					characters.next().charCodeAt(0)  === 42 && 
        					characters.look(1).charCodeAt(0) === 47
    					) {
        					characters.next(); 
        					break;
        				}
        			}
        		} else {
        			currentLine += character;
        		}
        	}
        }

        component.output     = output;
        component.stylesheet = 0;
        component.id         = id;
	} else {
		// retrieve cache
		id     = component.id;
		output = component.output;
	}

    if (element == null) {
    	// cache for server-side rendering
    	return component.output = '<style id="'+id+'">'+output+'</style>';
    } else {
    	element.setAttribute(styleNS, id);

    	// create style element and append to head
    	// only when stylesheet is a function
    	// this insures we will only ever excute this once 
    	// since we mutate the .stylesheet property to 0
    	if (func) {
    		// avoid adding a style element when one is already present
    		if (document.querySelector('style#'+id) == null) {
	    		var style              = document.createElement('style');
	    			
                    style.textContent  = output;
	    			style.id           = id;

				document.head.appendChild(style);
    		}
    	}
    }
}

