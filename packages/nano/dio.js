/*
 *  ___ __ __  
 * (   (  /  \ 
 *  ) ) )( () )
 * (___(__\__/ 
 * 
 * dio is a javascript framework for building applications.
 * 
 * @licence MIT
 */
(function (factory) {
	if (typeof exports === 'object' && typeof module !== 'undefined') {
		module.exports = factory(global);
	}
	else if (typeof define === 'function' && define.amd) {
		define(factory(window));
	}
	else {
		window.dio = factory(window);
	}
}(function (window) {


	'use strict';


	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * constants
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	// current version
	var version = '6.1.1';
	
	// enviroment
	var document = window.document || null;
	var browser = document !== null;
	
	// other
	var Promise = window.Promise;
	var requestAnimationFrame = window.requestAnimationFrame;
	var setImmediate = window.setImmediate;
	
	var promiseSupport = Promise !== void 0;
	var requestAnimationFrameSupport = requestAnimationFrame !== void 0;
	var setImmediateSupport = setImmediate !== void 0;
	
	// namespaces
	var nsStyle = 'data-scope';
	var nsMath = 'http://www.w3.org/1998/Math/MathML';
	var nsXlink = 'http://www.w3.org/1999/xlink';
	var nsSvg = 'http://www.w3.org/2000/svg';
	
	// empty shapes
	var objEmpty = {};
	var arrEmpty = [];
	var nodeEmpty = createNodeShape(0, '', objEmpty, arrEmpty, null, null, 0, null, void 0);
	var funcEmpty = function () {};
	var fragProps = {style: 'display: inherit;'};
	
	
	/**
	 * schedule callback
	 * 
	 * @type {function}
	 * @param {function} callback
	 */
	var schedule;
	
	if (requestAnimationFrameSupport) {
		schedule = function schedule (callback) { 
			requestAnimationFrame(callback);
		}
	}
	else if (setImmediateSupport) {
		schedule = function schedule (callback) { 
			setImmediate(callback); 
		}
	}
	else if (promiseSupport) {
		schedule = function schedule (callback) { 
			Promise.resolve().then(callback); 
		}
	}
	else {
		schedule = function schedule (callback) { 
			setTimeout(callback, 0); 
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * Node shapes
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * element shape
	 *
	 * @public
	 * 
	 * @param  {string}               type
	 * @param  {Object<string, any>=} props
	 * @param  {VNode[]=}             children
	 * @return {VNode}
	 */
	function createElementShape (type, props, children) {
		return {
			Type: 1,
			type: type,
			props: (props = props != null ? props : objEmpty),
			children: (children == null ? [] : children),
			DOMNode: null,
			instance: null,
			index: 0,
			nodeName: null,
			key: props !== objEmpty ? props.key : void 0
		};
	}
	
	
	/**
	 * component shape
	 *
	 * @public
	 * 
	 * @param  {(function|Component)} type
	 * @param  {Object<string, any>=} props
	 * @param  {any[]=}               children
	 * @return {VNode}
	 */
	function createComponentShape (type, props, children) {
		return {
			Type: 2,
			type: type,
			props: (props = props != null ? props : objEmpty),
			children: (children == null ? arrEmpty : children),
			DOMNode: null,
			instance: null,
			index: 0,
			nodeName: null,
			key: props !== objEmpty ? props.key : void 0
		};
	}
	
	
	/**
	 * fragment shape
	 *
	 * @public
	 * 
	 * @param  {VNode[]} children
	 * @return {VNode}
	 */
	function createFragmentShape (children) {
		return {
			Type: 1,
			type: 'fragment',
			props: fragProps,
			children: children,
			DOMNode: null,
			instance: null,
			index: 0,
			nodeName: null,
			key: void 0
		};
	}
	
	
	/**
	 * create text shape
	 *
	 * @public
	 * 
	 * @param  {(string|boolean|number)} text
	 * @return {VNode}
	 */
	function createTextShape (text) {
		return {
			Type: 3,
			type: '#text',
			props: objEmpty,
			children: text,
			DOMNode: null,
			instance: null,
			index: 0,
			nodeName: null,
			key: void 0
		};
	}
	
	
	/**
	 * svg shape
	 *
	 * @public
	 * 
	 * @param  {string}               type
	 * @param  {Object<string, any>=} props
	 * @param  {VNode[]=}             children
	 * @return {VNode}
	 */
	function createSvgShape (type, props, children) {
		return {
			Type: 1,
			type: type,
			props: (props == null ? (props = {xmlns: nsSvg}) : (props.xmlns = nsSvg, props)),
			children: (children == null ? [] : children),
			DOMNode: null,
			instance: null,
			index: 0,
			nodeName: null,
			key: props.key
		};
	}
	
	
	/**
	 * create node shape
	 *
	 * @param  {number}                      Type
	 * @param  {(string|function|Component)} type
	 * @param  {Object<string, any>}         props
	 * @param  {VNode[]}                     children
	 * @param  {Node}                        DOMNode
	 * @param  {Component}                   instance
	 * @param  {number}                      index
	 * @param  {string?}                     nodeName
	 * @param  {any}                         key
	 * @return {VNode}
	 */
	function createNodeShape (Type, type, props, children, DOMNode, instance, index, nodeName, key) {
		return {
			Type: Type,
			type: type,
			props: props,
			children: children,
			DOMNode: DOMNode,
			instance: instance,
			index: index,
			nodeName: nodeName,
			key: key
		};
	}
	
	
	/**
	 * empty shape
	 * 
	 * @return {VNode}
	 */
	function createEmptyShape () {
		return {
			Type: 1,
			type: 'noscript',
			props: objEmpty,
			children: [],
			DOMNode: null,
			instance: null,
			index: 0,
			nodeName: null,
			key: void 0
		};
	}
	
	
	/**
	 * portal shape
	 *
	 * @public
	 * 
	 * @param  {Node} DOMNode
	 * @return {VNode}
	 */
	function createPortalShape (type, props, children) {
		return {
			Type: 4,
			type: type.nodeName.toLowerCase(),
			props: (props = props != null ? props : objEmpty),
			children: (children == null ? [] : children),
			DOMNode: type,
			instance: null,
			index: 0,
			nodeName: null,
			key: props !== objEmpty ? props.key : void 0
		};
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * stylesheet
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * create scoped stylesheet
	 *
	 * @param {Component} component
	 * @param {function}  constructor
	 * @param {Node?}     element
	 */
	function createScopedStylesheet (component, constructor, element) {
		try {
			// create
			if (component.stylesheet.CSSNamespace === void 0) {
				createScopedCSS(component, constructor.COMPCache || constructor, true)(element);
			}
			// namespace
			else {
				component.stylesheet(element);
			}
		}
		catch (error) {
			componentErrorBoundary(error, component, 'stylesheet');
		}
	}
	
	
	/**
	 * create scoped css
	 * 
	 * @param  {Component}       component
	 * @param  {function}        constructor
	 * @param  {boolean}         inject
	 * @return {function(?Node)}
	 */
	function createScopedCSS (component, constructor, inject) {
		var namespace = component.displayName || constructor.name;
		var selector = '['+nsStyle+'='+namespace+']';
		var css = component.stylesheet();
		var output = stylesheet(selector, css, true, true, null);
	
		if (browser && inject) {
			// obscure namesapce to avoid id/global namespace conflicts
			var id = '\''+namespace+'\'';
	
			// prevent duplicate styles when SSR outputs stylesheet
			if (document.getElementById(id) == null) {			
				var style = document.createElement('style');
				
				style.textContent = output;
				style.id = id;
	
				document.head.appendChild(style);
			}
		}
	
		/**
		 * decorator
		 * 
		 * @param  {?Node} DOMNode
		 * @return {(undefined|string)}
		 */
		function decorator (DOMNode) {
			// SSR
			if (DOMNode === null) {
				return output;
			}
			// DOM
			else {
				DOMNode.setAttribute(nsStyle, namespace);
			}
		}
	
		decorator.CSSNamespace = namespace;
	
		// replace stylesheet method for all instances with the style constructor `decorator`
		return component.stylesheet = constructor.prototype.stylesheet = decorator;
	}
	
	
	/**
	 * css preprocessor
	 *
	 * @example stylesheet('.foo', 'css...', true, true, null);
	 * 
	 * @param  {string}   selector   - i.e `.class` or `#id` or `[attr=id]`
	 * @param  {string}   styles     - css string
	 * @param  {boolean=} animations - prefix animations and keyframes, true by default
	 * @param  {boolean=} compact    - enable additional features(mixins and variables)
	 * @param  {function(context, content, line, column)=} middleware
	 * @return {string}
	 */
	function stylesheet (selector, styles, animations, compact, middleware) {
	    // to string
	    selector += '';
	
	    var prefix = '';
	    var namespace = '';
	    var type = selector.charCodeAt(0) || 0;
	
	    // [ attr selector
	    if (type === 91) {
	        // `[data-id=namespace]` -> ['data-id', 'namespace']
	        var attr = selector.substring(1, selector.length-1).split('=');
	        var char = (namespace = attr[1]).charCodeAt(0);
	
	        // [data-id="namespace"]/[data-id='namespace']
	        // --> "namespace"/'namspace' --> namespace
	        if (char === 34 || char === 39) {
	            namespace = namespace.substring(1, namespace.length-1);
	        }
	
	        prefix = '['+ attr[0] + '="' + namespace +'"]';
	    }
	    // `#` `.` `>` id class and descendant selectors
	    else if (type === 35 || type === 46 || type === 62) {
	        namespace = (prefix = selector).substring(1);
	    }
	    // element selector
	    else {
	        namespace = prefix = selector;
	    }
	
	    // reset type signature
	    type = 0;
	
	    var animns;
	
	    // animation and keyframe namespace
	    if (animations == void 0 || animations === true) {
	        animations = true;
	        animns = namespace;
	    }
	    else {
	        animns = '';
	        animations = false;
	    }
	
	    // uses middleware
	    var use = middleware != null;
	    var plugins;
	
	    // middleware
	    if (use) {
	        var uses = (typeof middleware).charCodeAt(0);
	
	        // o, object of middlewares
	        if (uses === 111) {
	            stylesheet.use(middleware, null);
	        }
	        // f, not a single function middleware
	        else if (uses !== 102) {
	            use = false;
	        }
	    }
	
	    // plugins
	    if ((plugins = stylesheet.plugins).length !== 0) {
	        middleware = function (ctx, str, line, col) {
	            var output = str;
	
	            for (var i = 0, length = plugins.length; i < length; i++) {
	                output = plugins[i](ctx, output, line, col) || output;
	            }
	
	            return output !== str ? output : void 0;
	        };
	
	        use = true;
	    }
	
	    // declare
	    var colon;
	    var inner;
	    var selectors;
	    var build;
	    var media;
	    var temp;
	    var prev;
	    var indexOf;
	
	    // variables
	    var variables;
	
	    // mixins
	    var mixins;
	    var mixin;
	
	    // buffers
	    var buff = '';
	    var blob = '';
	    var blck = '';
	    var nest = '';
	    var flat = '';
	
	    // context signatures       
	    var special = 0;
	    var close = 0;
	    var closed = 0;
	    var comment = 0;
	    var strings = 0;
	    var nested = 0;
	    var func = 0;
	
	    // context(flat) signatures
	    var levels = 0;
	    var level = 0;
	
	    // prefixes
	    var moz = '-moz-';
	    var ms = '-ms-';
	    var webkit = '-webkit-';
	
	    if (use) {
	        temp = middleware(0, styles, line, column);
	        
	        if (temp != null) {
	            styles = temp;
	        }
	    }
	
	    // positions
	    var caret = 0;
	    var depth = 0;
	    var column = 0;
	    var line = 1;
	    var eof = styles.length;
	
	    // compiled output
	    var output = '';
	
	    // parse + compile
	    while (caret < eof) {
	        var code = styles.charCodeAt(caret);
	
	        // {, }, ; characters, parse line by line
	        if (strings === 0 && func === 0 && (code === 123 || code === 125 || code === 59)) {
	            buff += styles.charAt(caret);
	
	            var first = buff.charCodeAt(0);
	
	            // only trim when the first character is a space ` `
	            if (first === 32) {
	                first = (buff = buff.trim()).charCodeAt(0);
	            }
	
	            // default to 0 instead of NaN if there is no second/third character
	            var second = buff.charCodeAt(1) || 0;
	            var third = buff.charCodeAt(2) || 0;
	
	            // middleware, selector/property context, }
	            if (use && code !== 125) {
	                // { selector context
	                if (code === 123) {
	                    temp = middleware(1, buff.substring(0, buff.length - 1).trim(), line, column);
	                } 
	                // ; property context
	                else {
	                    temp = middleware(2, buff, line, column);
	                }
	
	                if (temp != null) {
	                    buff = code === 123 ? temp + '{' : temp;
	                }
	            }
	
	            // ignore comments
	            if (comment === 2) {
	                code === 125 && (comment = 0);
	                buff = ''; 
	            }
	            // @, special block
	            else if (first === 64) {
	                // push flat css
	                if (levels === 1 && flat.length !== 0) {
	                    levels = 0;
	                    flat = prefix + ' {' + flat + '}';
	
	                    // middleware, flat context
	                    if (use) {
	                        temp = middleware(4, flat, line, column);
	                    
	                        if (temp != null) {
	                            flat = temp;
	                        }
	                    }
	
	                    output += flat;
	                    flat = '';
	                }
	
	                // @keyframe/@global, `k` or @global, `g` character
	                if (second === 107 || second === 103) {
	                    // k, @keyframes
	                    if (second === 107) {
	                        blob = buff.substring(1, 11) + animns + buff.substring(11);
	                        buff = '@'+webkit+blob;
	                        type = 1;
	                    }
	                    // g, @global
	                    else {
	                        buff = '';
	                    }
	                }
	                // @media/@mixin `m` character
	                else if (second === 109) {
	                    // @mixin
	                    if (compact === true && third === 105) {
	                        // first match create mixin store
	                        mixins === void 0 && (mixins = {});
	
	                        // retrieve mixin identifier
	                        blob = (mixin = buff.substring(7, buff.indexOf('{')) + ' ').trim();
	
	                        // cache current mixin name
	                        mixin = mixin.substring(0, mixin.indexOf(' ')).trim();
	
	                        // append mixin identifier
	                        mixins[mixin] = {key: blob.trim(), body: ''};
	
	                        type = 3;
	                        buff = '';
	                        blob = '';
	                    }
	                    // @media
	                    else if (third === 101) {
	                        // nested
	                        if (depth !== 0) {
	                            // discard first character {
	                            caret++;
	                            
	                            media = '';
	                            inner = '';
	                            selectors = prev.split(',');
	
	                            // keep track of opening `{` and `}` occurrences
	                            closed = 1;
	
	                            // travel to the end of the block
	                            while (caret < eof) {
	                                char = styles.charCodeAt(caret);
	
	                                // {, }, nested blocks may have nested blocks
	                                char === 123 ? closed++ : char === 125 && closed--;
	
	                                // break when the nested block has ended
	                                if (closed === 0) {
	                                    break;
	                                }
	
	                                // build content of nested block
	                                inner += styles.charAt(caret++);
	                            }
	
	                            for (var i = 0, length = selectors.length; i < length; i++) {
	                                selector = selectors[i];
	
	                                // build media block
	                                media += stylesheet(
	                                    // remove { on last selector
	                                    (i === length - 1 ? selector.substring(0, selector.length - 1) :  selector).trim(),
	                                    inner, 
	                                    animations, 
	                                    compact, 
	                                    middleware
	                                );
	                            }
	
	                            media = buff + media + '}';
	                            buff = '';
	                            type = 4;
	                        }
	                        // top-level
	                        else {
	                            type = 2;
	                        }
	                    }
	                    // unknown
	                    else {
	                        type = 6;
	                    }
	                }
	
	                // @include/@import `i` character
	                if (second === 105) {
	                    // @include `n` character
	                    if (compact === true && third === 110) {
	                        buff = buff.substring(9, buff.length - 1);
	                        indexOf = buff.indexOf('(');
	
	                        // function mixins
	                        if (indexOf > -1) {
	                            // mixin name
	                            var name = buff.substring(0, indexOf);
	
	                            // mixin data
	                            var data = mixins[name];
	
	                            // args passed to the mixin
	                            var argsPassed = buff.substring(name.length+1, buff.length - 1).split(',');
	
	                            // args the mixin expects
	                            var argsExpected = data.key.replace(name, '').replace(/\(|\)/g, '').trim().split(',');
	                            
	                            buff = data.body;
	
	                            for (var i = 0, length = argsPassed.length; i < length; i++) {
	                                var arg = argsExpected[i].trim();
	
	                                // if the mixin has a slot for that arg
	                                if (arg !== void 0) {
	                                    buff = buff.replace(new RegExp('var\\(~~'+arg+'\\)', 'g'), argsPassed[i].trim());
	                                }
	                            }
	
	                            // create block and update styles length
	                            styles += buff;
	                            eof += buff.length;
	
	                            // reset
	                            buff = '';
	                        }
	                        // static mixins
	                        else {
	                            buff = mixins[buff].body;
	
	                            if (depth === 0) {
	                                // create block and update styles length
	                                styles += buff;
	                                eof += buff.length;
	
	                                // reset
	                                buff = '';
	                            }
	                        }
	                    }
	                    // @import `m` character
	                    else if (third === 109 && use) {
	                        // avoid "foo.css"; "foo" screen; "http://foo.com/bar"; url(foo);
	                        var match = /@import.*?(["'`][^\.\n\r]*?["'`];|["'`][^:\r\n]*?\.[^c].*?["'`])/g.exec(buff);
	
	                        if (match !== null) {
	                            // middleware, import context
	                            buff = middleware(5, match[1].replace(/['"; ]/g, ''), line, column) || '';
	
	                            if (buff) {
	                                // create block and update styles length
	                                styles = styles.substring(0, caret+1) + buff + styles.substring(caret+1);
	                                eof += buff.length;
	                            }
	
	                            buff = '';
	                        }
	                    }
	                }
	                // flag special, i.e @keyframes, @global
	                else if (type !== 4) {
	                    close = -1;
	                    special++;
	                }
	            }
	            // ~, ; variables
	            else if (compact === true && code === 59 && first === 126 && second === 126) {
	                colon = buff.indexOf(':');
	
	                // first match create variables store 
	                variables === void 0 && (variables = []);
	
	                // push key value pair
	                variables[variables.length] = [buff.substring(0, colon), buff.substring(colon+1, buff.length - 1).trim()];
	
	                // reset buffer
	                buff = '';
	            }
	            // property/selector
	            else {
	                // animation: a, n, i characters
	                if (first === 97 && second === 110 && third === 105) {
	                    // removes ;
	                    buff = buff.substring(0, buff.length - 1);
	
	                    // position of :
	                    colon = buff.indexOf(':')+1;
	
	                    // left hand side everything before `:`
	                    build = buff.substring(0, colon);
	
	                    // right hand side everything after `:` /* @type string[] */
	                    var anims = buff.substring(colon).trim().split(',');
	
	                    // - short hand animation syntax
	                    if (animations === true && (buff.charCodeAt(9) || 0) !== 45) {
	                        // because we can have multiple animations `animation: slide 4s, slideOut 2s`
	                        for (var j = 0, length = anims.length; j < length; j++) {
	                            var anim = anims[j];
	                            var props = anim.split(' ');
	
	                            // since we can't be sure of the position of the name of the animation we have to find it
	                            for (var k = 0, l = props.length; k < l; k++) {
	                                var prop = props[k].trim();
	                                var frst = prop.charCodeAt(0);
	                                var third = prop.charCodeAt(2);
	                                var len = prop.length;
	                                var last = prop.charCodeAt(len - 1);
	
	                                // animation name is anything not in this list
	                                if (
	                                    // cubic-bezier()/steps(), ) 
	                                    last !== 41 && len !== 0 &&
	
	                                    // infinite, i, f, e
	                                    !(frst === 105 && third === 102 && last === 101 && len === 8) &&
	
	                                    // linear, l, n, r
	                                    !(frst === 108 && third === 110 && last === 114 && len === 6) &&
	
	                                    // alternate/alternate-reverse, a, t, e
	                                    !(frst === 97 && third === 116 && last === 101 && (len === 9 || len === 17)) &&
	
	                                    // normal, n, r, l
	                                    !(frst === 110 && third === 114 && last === 108 && len === 6) &&
	
	                                    // backwards, b, c, s
	                                    !(frst === 98 && third === 99 && last === 115 && len === 9) &&
	
	                                    // forwards, f, r, s
	                                    !(frst === 102 && third === 114 && last === 115 && len === 8) &&
	
	                                    // both, b, t, h
	                                    !(frst === 98 && third === 116 && last === 104 && len === 4) &&
	
	                                    // none, n, n, e
	                                    !(frst === 110 && third === 110 && last === 101 && len === 4)&&
	
	                                    // running, r, n, g 
	                                    !(frst === 114 && third === 110 && last === 103 && len === 7) &&
	
	                                    // paused, p, u, d
	                                    !(frst === 112 && third === 117 && last === 100 && len === 6) &&
	
	                                    // reversed, r, v, d
	                                    !(frst === 114 && third === 118 && last === 100 && len === 8) &&
	
	                                    // step-start/step-end, s, e, (t/d)
	                                    !(
	                                        frst === 115 && third === 101 && 
	                                        ((last === 116 && len === 10) || (last === 100 && len === 8)) 
	                                    ) &&
	
	                                    // ease/ease-in/ease-out/ease-in-out, e, s, e
	                                    !(
	                                        frst === 101 && third === 115 &&
	                                        (
	                                            (last === 101 && len === 4) ||
	                                            (len === 11 || len === 7 || len === 8) && prop.charCodeAt(4) === 45
	                                        )
	                                    ) &&
	
	                                    // durations, 0.4ms, .4s, 400ms ...
	                                    isNaN(parseFloat(prop)) &&
	
	                                    // handle spaces in cubic-bezier()/steps() functions
	                                    prop.indexOf('(') === -1
	                                ) {
	                                    props[k] = animns + prop;
	                                }
	                            }
	
	                            build += (j === 0 ? '' : ',') + props.join(' ').trim();
	                        }
	                    }
	                    // explicit syntax, anims array should have only one elemenet
	                    else {
	                        // n
	                        build += ((buff.charCodeAt(10) || 0) !== 110 ? '' : animns) + anims[0].trim();
	                    }
	
	                    // vendor prefix
	                    buff = webkit + build + ';' + build + ';';
	                }
	                // appearance: a, p, p
	                else if (first === 97 && second === 112 && third === 112) {
	                    // vendor prefix -webkit- and -moz-
	                    buff = (
	                        webkit + buff + 
	                        moz + buff + 
	                        buff
	                    );
	                }
	                // display: d, i, s
	                else if (first === 100 && second === 105 && third === 115) {
	                    // flex/inline-flex
	                    if ((indexOf = buff.indexOf('flex')) > -1) {
	                        // e, inline-flex
	                        temp = buff.charCodeAt(indexOf-2) === 101 ? 'inline-' : '';
	
	                        // vendor prefix
	                        buff = 'display:'+webkit+temp+'box;display:'+webkit+temp+'flex;'+ms+'flexbox;display:'+temp+'flex;';
	                    }
	                }
	                // transforms & transitions: t, r, a 
	                else if (first === 116 && second === 114 && third === 97) {
	                    // vendor prefix -webkit- and -ms- if transform
	                    buff = (
	                        webkit + buff + 
	                        (buff.charCodeAt(5) === 102 ? ms + buff : '') + 
	                        buff
	                    );
	                }
	                // hyphens: h, y, p
	                // user-select: u, s, e
	                else if (
	                    (first === 104 && second === 121 && third === 112) ||
	                    (first === 117 && second === 115 && third === 101)
	                ) {
	                    // vendor prefix all
	                    buff = (
	                        webkit + buff + 
	                        moz + buff + 
	                        ms + buff + 
	                        buff
	                    );
	                }
	                // flex: f, l, e
	                else if (first === 102 && second === 108 && third === 101) {
	                    // vendor prefix all but moz
	                    buff = (
	                        webkit + buff + 
	                        ms + buff + 
	                        buff
	                    );
	                }
	                // order: o, r, d
	                else if (first === 111 && second === 114 && third === 100) {
	                    // vendor prefix all but moz
	                    buff = (
	                        webkit + buff + 
	                        ms + 'flex-' + buff + 
	                        buff
	                    );
	                }
	                // align-items, align-center, align-self: a, l, i, -
	                else if (first === 97 && second === 108 && third === 105 && (buff.charCodeAt(5) || 0) === 45) {
	                    switch (buff.charCodeAt(6) || 0) {
	                        // align-items, i
	                        case 105: {
	                            temp = buff.replace('-items', '');
	                            buff = (
	                                webkit + 'box-' + temp + 
	                                ms + 'flex-'+ temp + 
	                                buff
	                            );
	                            break;
	                        }
	                        // align-self, s
	                        case 115: {
	                            buff = (
	                                ms + 'flex-item-' + buff.replace('-self', '') + 
	                                buff
	                            );
	                            break;
	                        }
	                        // align-content
	                        default: {
	                            buff = (
	                                ms + 'flex-line-pack' + buff.replace('align-content', '') + 
	                                buff
	                            );
	                            break;
	                        }
	                    }
	                }
	                // { character, selector declaration
	                else if (code === 123) {
	                    depth++;
	
	                    // push flat css
	                    if (levels === 1 && flat.length !== 0) {
	                        levels = 0;
	                        flat = prefix + ' {' + flat + '}';
	
	                        // middleware, flat context
	                        if (use) {
	                            temp = middleware(4, flat, line, column);
	                        
	                            if (temp != null) {
	                                flat = temp;
	                            }
	                        }
	
	                        output += flat;
	                        flat = '';
	                    }
	
	                    if (special === 0 || type === 2) {
	                        // nested selector
	                        if (depth === 2) {
	                            // discard first character {
	                            caret++;
	
	                            // inner content of block
	                            inner = '';
	
	                            var nestSelector = buff.substring(0, buff.length-1).split(',');
	                            var prevSelector = prev.substring(0, prev.length-1).split(',');
	
	                            // keep track of opening `{` and `}` occurrences
	                            closed = 1;
	
	                            // travel to the end of the block
	                            while (caret < eof) {
	                                char = styles.charCodeAt(caret);
	
	                                // {, }, nested blocks may have nested blocks
	                                char === 123 ? closed++ : char === 125 && closed--;
	
	                                // break when the nested block has ended
	                                if (closed === 0) {
	                                    break;
	                                }
	
	                                // build content of nested block
	                                inner += styles.charAt(caret++);
	                            }
	
	                            // handle multiple selectors: h1, h2 { div, h4 {} } should generate
	                            // -> h1 div, h2 div, h2 h4, h2 div {}
	                            for (var j = 0, length = prevSelector.length; j < length; j++) {
	                                // extract value, prep index for reuse
	                                temp = prevSelector[j];
	                                prevSelector[j] = '';
	
	                                // since there could also be multiple nested selectors
	                                for (var k = 0, l = nestSelector.length; k < l; k++) {
	                                    selector = temp.replace(prefix, '&').trim();
	
	                                    if (nestSelector[k].indexOf(' &') > 0) {
	                                        selector = nestSelector[k].replace('&', '').trim() + ' ' + selector;
	                                    }
	                                    else {
	                                        selector = selector + ' ' + nestSelector[k].trim();
	                                    }
	
	                                    prevSelector[j] += selector.trim() + (k === l - 1  ? '' : ',');
	                                }
	                            }
	
	                            // the `new line` is to avoid conflicts when the last line is a // line comment
	                            buff = ('\n' + prevSelector.join(',') + ' {'+inner+'}');
	
	                            // append nest
	                            nest += buff.replace(/ +&/g, '');
	
	                            // signature
	                            nested = 1;
	
	                            // clear current line, to avoid adding nested blocks to the normal flow
	                            buff = '';
	
	                            // decreament depth
	                            depth--;
	                        }
	                        // top-level selector
	                        else {
	                            selectors = buff.split(',');
	                            build = '';
	
	                            // prefix multiple selectors with namesapces
	                            // @example h1, h2, h3 --> [namespace] h1, [namespace] h1, ....
	                            for (var j = 0, length = selectors.length; j < length; j++) {
	                                var firstChar = (selector = selectors[j]).charCodeAt(0);
	
	                                // ` `, trim if first character is a space
	                                if (firstChar === 32) {
	                                    firstChar = (selector = selector.trim()).charCodeAt(0);
	                                }
	
	                                // [, [title="a,b,..."]
	                                if (firstChar === 91) {
	                                    for (var k = j+1, l = length-j; k < l; k++) {
	                                        var broken = (selector += ',' + selectors[k]).trim();
	
	                                        // ], end
	                                        if (broken.charCodeAt(broken.length-1) === 93) {
	                                            length -= k;
	                                            selectors.splice(j, k);
	                                            break;
	                                        }
	                                    }
	                                }
	
	                                // &
	                                if (firstChar === 38) {
	                                    // before: & {
	                                    selector = prefix + selector.substring(1);
	                                    // after: ${prefix} {
	                                }
	                                else {
	                                    // default to :global if & exist outside of the first non-space character
	                                    if ((indexOf = selector.indexOf(' &')) > 0) {
	                                        // `:`
	                                        firstChar = 58;
	                                        // before: html & {
	                                        selector = ':global('+selector.substring(0, indexOf)+')' + selector.substring(indexOf);
	                                        // after: html ${prefix} {
	                                    }
	
	                                    // :
	                                    if (firstChar === 58) {
	                                        var secondChar = selector.charCodeAt(1);
	
	                                        // h, t, :host
	                                        if (secondChar === 104 && selector.charCodeAt(4) === 116) {
	                                            var nextChar = (selector = selector.substring(5)).charCodeAt(0);
	
	                                            // :host(selector)                    
	                                            if (nextChar === 40) {
	                                                // before: `(selector)`
	                                                selector = prefix + selector.substring(1).replace(')', '');
	                                                // after: ${prefx} selector {
	                                            }
	                                            // :host-context(selector)
	                                            else if (nextChar === 45) {
	                                                indexOf = selector.indexOf(')');
	
	                                                // before: `-context(selector)`
	                                                selector = (
	                                                    selector.substring(9, indexOf)+' '+prefix+selector.substring(indexOf+1)
	                                                );
	                                                // after: selector ${prefix} {
	                                            }
	                                            // :host
	                                            else {
	                                                selector = prefix + selector;
	                                            }
	                                        }
	                                        // g, :global(selector)
	                                        else if (secondChar === 103) {
	                                            // before: `:global(selector)`
	                                            selector = selector.substring(8).replace(')', '').replace('&', prefix);
	                                            // after: selector
	                                        }
	                                        // :hover, :active, :focus, etc...
	                                        else {
	                                            selector = prefix + selector;
	                                        }
	                                    }
	                                    // non-pseudo selectors
	                                    else {
	                                        selector = prefix + ' ' + selector;
	                                    }
	                                }
	
	                                // if first selector do not prefix with `,`
	                                build += (j === 0 ? selector : ',' + selector);
	                            }
	
	                            // cache current selector
	                            prev = (buff = build);
	                        }
	                    }
	                }
	                // } character
	                else if (code === 125) {
	                    if (depth !== 0) {
	                        depth--;
	                    }
	
	                    // concat nested css
	                    if (depth === 0 && nested === 1) {
	                        styles = styles.substring(0, caret+1) + nest + styles.substring(caret+1);
	                        eof += nest.length;
	                        nest = '';
	                        nested = 0;
	                        close++;
	                    }
	                }
	
	                // @global/@keyframes
	                if (special !== 0) {
	                    // }, find closing tag
	                    if (code === 125) {
	                        close++;
	                    } 
	                    // {
	                    else if (code === 123 && close !== 0) {
	                        close--;
	                    }
	
	                    // append flat @media css
	                    if (level === 1 && (code === 123 || close === 0) && flat.length !== 0) {
	                        level = 0;
	                        buff = prefix + ' {'+flat+'}' + buff;
	                        flat = '';
	                    }
	
	                    // closing tag
	                    if (close === 0) {
	                        // @global
	                        if (type === 0) {
	                            buff = '';
	                        }
	                        // @keyframes 
	                        else if (type === 1) {
	                            // vendor prefix
	                            buff = '}@'+blob+'}';
	
	                            // reset
	                            blob = '';
	                        }
	                        // @mixin
	                        else if (type === 3) {
	                            // append body of mixin
	                            mixins[mixin].body = blob;
	
	                            // reset
	                            mixin = '';
	                            buff = '';
	                            blob = '';
	                        }
	
	                        // reset signatures
	                        type = 0;
	                        close--;
	                        special--;
	                    }
	                    // @keyframes, @mixin
	                    else if (type === 1 || type === 3) {
	                        blob += buff;
	
	                        if (type === 3) {
	                            buff = '';
	                        }
	                    }
	                    // @media flat context
	                    else if (type === 2 && depth === 0) {
	                        if (code !== 125) {
	                            if (level === 0) {
	                                flat = '';
	                            }
	
	                            flat += buff;
	                            buff = '';
	                        }
	
	                        level = 1;
	                    }
	                }
	                // flat context
	                else if (depth === 0 && code !== 125) {
	                    levels = 1;
	                    flat = flat === void 0 ? buff : flat + buff;
	                    buff = '';
	                }
	            }
	
	            // append line to blck buffer
	            blck += buff;
	
	            // reset line buffer
	            buff = '';
	
	            // add blck buffer to output
	            if (code === 125 && comment === 0 && (type === 0 || type === 4)) {                  
	                // append if the block is not empty {}
	                if (blck.charCodeAt(blck.length-2) !== 123) {
	                    // middleware, block context
	                    if (use && blck.length !== 0) {
	                        temp = middleware(3, blck, line, column);
	
	                        if (temp != null) {
	                            blck = temp;
	                        }
	                    }
	
	                    // append blck buffer
	                    output += blck.trim();
	                }
	
	                // nested @media
	                if (type === 4) {
	                    // middleware, block context
	                    if (use) {
	                        temp = middleware(3, media, line, column);
	
	                        if (temp != null) {
	                            media = temp;
	                        }
	                    }
	
	                    // reset
	                    type = 0;
	
	                    // concat nested @media block
	                    output += media;
	                }
	
	                // reset blck buffer
	                blck = '';
	            }
	        }
	        // build line by line
	        else {
	            // \r, \n, new lines
	            if (code === 13 || code === 10) {
	                // ignore line and block comments
	                if (comment === 2) {
	                    buff = '';
	                    comment = 0;
	                }
	
	                column = 0;
	                line++;
	            }
	            // not `\t` tab character
	            else if (code !== 9) {
	                switch (code) {
	                    // " character
	                    case 34: {
	                        // exit string " context / enter string context
	                        strings = strings === 34 ? 0 : (strings === 39 ? 39 : 34);
	                        break;
	                    }
	                    // ' character
	                    case 39: {
	                        // exit string ' context / enter string context
	                        strings = strings === 39 ? 0 : (strings === 34 ? 34 : 39);
	                        break;
	                    }
	                    // ( character
	                    case 40: {
	                        strings === 0 && (func = 1);
	                        break;
	                    }
	                    // ) character
	                    case 41: {
	                        strings === 0 && (func = 0);
	                        break;
	                    }
	                    // / character
	                    case 47: {
	                        if (strings === 0 && func !== 1) {
	                            code === 47 && comment < 2 && comment++;
	                        }
	                        break;
	                    }
	                }
	
	                // build line buffer
	                buff += styles.charAt(caret);
	            }
	        }
	
	        // move caret position
	        caret++;
	
	        // move column position
	        column++;
	    }
	
	    // trailing flat css
	    if (flat !== void 0 && flat.length !== 0) {
	        flat = prefix + ' {' + flat + '}';
	
	        // middleware, flat context
	        if (use) {
	            temp = middleware(4, flat, line, column);
	        
	            if (temp != null) {
	                flat = temp;
	            }
	        }
	
	        // append flat css
	        output += flat;
	    }
	
	    // has variables
	    if (compact && variables !== void 0) {
	        // replace all variables
	        for (var i = 0, length = variables.length; i < length; i++) {
	            output = output.replace(new RegExp('var\\('+variables[i][0]+'\\)', 'g'), variables[i][1]);
	        }
	    }
	
	    // middleware, output context
	    if (use) {
	        temp = middleware(6, output, line, column);
	    
	        if (temp != null) {
	            output = temp;
	        }
	    }
	
	    return output;
	}
	
	
	/**
	 * use plugin
	 * 
	 * @param  {string|function|function[]} key
	 * @param  {function?} plugin
	 * @return {Object} {use, plugins}
	 */
	stylesheet.use = function (key, plugin) {
	    var plugins = stylesheet.plugins;
	    var length = plugins.length;
	
	    if (plugin == null) {
	        plugin = key;
	        key = void 0;
	    }
	
	    if (plugin != null) {
	        // object of plugins
	        if (plugin.constructor === Object) {
	            for (var name in plugin) {
	                stylesheet.use(name, plugin[name]);
	            }
	        }
	        // array of plugins
	        else if (plugin.constructor === Array) {
	            for (var i = 0, length = plugin.length; i < length; i++) {
	                plugins[length++] = plugin[i];
	            }
	        }
	        // single un-keyed plugin
	        else if (key == null) {
	            plugins[length] = plugin;
	        }
	        // keyed plugin
	        else {
	            var pattern = (key instanceof RegExp) ? key : new RegExp(key + '\\([ \\t\\r\\n]*([^\\0]*?)[ \\t\\r\\n]*\\)', 'g');
	            var regex = /[ \t\r\n]*,[ \t\r\n]*/g;
	
	            plugins[length] = function (ctx, str, line, col) {
	                if (ctx === 6) {
	                    str = str.replace(pattern, function (match, group) {
	                        var args = group.replace(regex, ',').split(',');
	                        var replace = plugin.apply(null, args);
	
	                        return replace != null ? replace : match;
	                    });
	
	                    return str;
	                }
	            }
	        }
	    }
	
	    return stylesheet;
	};
	
	
	/**
	 * plugin store
	 * 
	 * @type {function[]}
	 */
	stylesheet.plugins = [];
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * element
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * create virtual element
	 *
	 * @public
	 * 
	 * @param  {(string|function|Component)} type
	 * @param  {Object<string, any>=}        props
	 * @param  {...any=}                     children
	 * @return {Object<string, any>}
	 */
	function createElement (type, props) {
		if (type == null) {
			return createEmptyShape();
		}
	
		var length = arguments.length;
		var children = [];
		var position = 2;
	
		// if props is not a normal object
		if (props == null || props.constructor !== Object || props.props !== void 0) {
			// update position if props !== null
			if (props !== null) {
				props = null;
				position = 1; 
			}
		}
	
		if (length !== 1) {
			var index = 0;
			
			// construct children
			for (var i = position; i < length; i++) {
				var child = arguments[i];
				
				// only add non null/undefined children
				if (child != null) {
					// if array, flatten
					if (child.constructor === Array) {
						// add array child
						for (var j = 0, len = child.length; j < len; j++) {
							index = createChild(child[j], children, index);
						}
					}
					else {
						index = createChild(child, children, index);
					}
				}
			}
		}
	
		var typeOf = typeof type;
	
		if (typeOf === 'string') {
			// fragment
			if (type === '@') {
				return createFragmentShape(children);
			}
			// element
			else {
				if (props === null) {
					props = {};
				}
	
				// svg and math namespaces
				if (type === 'svg') {
					props.xmlns = nsSvg; 
				}
				else if (type === 'math') { 
					props.xmlns = nsMath;
				}
	
				return createElementShape(type, props, children);
			}
		}
		// component
		else if (typeOf === 'function') {
			return createComponentShape(type, props, children);
		}
		// hoisted
		else if (type.Type != null) {
			return cloneElement(type, props, children);
		}
		// portal
		else if (type.nodeType != null) {
			return createPortalShape(type, props != null ? props : objEmpty, children);
		}
		// fragment
		else {
			return createElement('@', null, type);
		}
	}
	
	
	/**
	 * create virtual child node
	 * 
	 * @param  {*}       child
	 * @param  {VNode[]} children
	 * @param  {number}  index
	 * @return {number}  index
	 */
	function createChild (child, children, index) {
		if (child != null) {
			// vnode
			if (child.Type !== void 0) {
				children[index++] = child;
			}
			// portal
			else if (child.nodeType !== void 0) {
				children[index++] = createPortalShape(child, objEmpty, arrEmpty);
			}
			else {
				var type = typeof child;
	
				// function/component
				if (type === 'function') {
					children[index++] = createComponentShape(child, objEmpty, arrEmpty);
				}
				// array
				else if (type === 'object') {
					for (var i = 0, length = child.length; i < length; i++) {
						index = createChild(child[i], children, index);
					}
				}
				// text
				else {
					children[index++] = createTextShape(type !== 'boolean' ? child : '');
				}
			}
		}
	
		return index;
	}
	
	
	/**
	 * clone and return an element having the original element's props
	 * with new props merged in shallowly and new children replacing existing ones.
	 *
	 * @public
	 * 
	 * @param  {VNode}                subject
	 * @param  {Object<string, any>=} newProps
	 * @param  {any[]=}               newChildren
	 * @return {VNode}
	 */
	function cloneElement (subject, newProps, newChildren) {
		var type = subject.type;
		var props = subject.props;
		var children = newChildren || subject.children;
	
		newProps = newProps || {};
	
		// copy old props
		for (var name in subject.props) {
			if (newProps[name] === void 0) {
				newProps[name] = props[name];
			}
		}
	
		// replace children
		if (newChildren !== void 0) {
			var length = newChildren.length;
	
			// if not empty, copy
			if (length > 0) {
				var index = 0;
				
				children = [];
	
				// copy old children
				for (var i = 0; i < length; i++) {
					index = createChild(newChildren[i], children, index);
				}
			}
		}
	
		return createElement(type, newProps, children);
	}
	
	
	/**
	 * clone virtual node
	 * 
	 * @param  {VNode} subject
	 * @return {VNode}
	 */
	function cloneNode (subject) {
		return createNodeShape(
			subject.Type,
			subject.type,
			subject.props,
			subject.children,
			subject.DOMNode,
			null,
			0,
			null,
			void 0
		);
	}
	
	
	/**
	 * create element factory
	 * 
	 * @param  {string}              type
	 * @param  {Object<string, any>} props
	 * @return {createElement(?Object<string>, ...any=)}
	 */
	function createFactory (type, props) {
		return props != null ? createElement.bind(null, type, props) : createElement.bind(null, type);
	}
	/**
	 * is valid element
	 *
	 * @public
	 * 
	 * @param  {any} subject
	 * @return {boolean}
	 */
	function isValidElement (subject) {
		return subject != null && subject.Type != null;
	}
	
	
	/**
	 * DOM factory, create vnode factories
	 *
	 * @public
	 * 
	 * @param  {string[]}                 types
	 * @return {Object<string, function>} elements
	 */
	function DOM (types) {
		var elements = {};
	
		// add element factories
		for (var i = 0, length = types.length; i < length; i++) {
			elements[types[i]] = createElementShape.bind(null, types[i]);
		}
	
		return elements;
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * component
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * set state
	 *
	 * @public
	 * 
	 * @param {Object}                    newState
	 * @param {function(this:Component)=} callback
	 */
	function setState (newState, callback) {
		// exist early if shouldComponentUpdate exists and returns false
		if (
			this.shouldComponentUpdate !== void 0 && 
			componentUpdateBoundary(this, 'shouldComponentUpdate', this.props, newState) === false
		) {
			return;
		}
	
		// update state
		updateState(this.state, newState);
	
		// callback
		if (callback != null && typeof callback === 'function') {
			componentStateBoundary(this, callback, 0);
		}
	
		// update component
		this.forceUpdate();
	}
	
	
	/**
	 * update state, hoisted to avoid `for in` deopts
	 * 
	 * @param {Object} oldState
	 * @param {Object} newState
	 */
	function updateState (oldState, newState) {	
		if (oldState != null) {
			for (var name in newState) {
				oldState[name] = newState[name];
			}
		}
	}
	
	
	/**
	 * force an update
	 *
	 * @public
	 * 
	 * @param  {function(this:Component)=} callback
	 */
	function forceUpdate (callback) {	
		if (this.componentWillUpdate !== void 0) {
			componentUpdateBoundary(this, 'componentWillUpdate', this.props, this.state);
		}
	
		var oldNode = this['--vnode'];
		var newNode = extractRenderNode(this);
	
		var newType = newNode.Type;
		var oldType = oldNode.Type;
	
		// different root node
		if (newNode.type !== oldNode.nodeName) {
			replaceRootNode(newNode, oldNode, newType, oldType, this);
		}
		// patch node
		else {
			// element root node
			if (oldType !== 3) {
				reconcileNodes(newNode, oldNode, newType, 1);
			} 
			// text root node
			else if (newNode.children !== oldNode.children) {
				oldNode.DOMNode.nodeValue = oldNode.children = newNode.children;
			}
		}
	
		if (this.componentDidUpdate !== void 0) {
			componentUpdateBoundary(this, 'componentDidUpdate', this.props, this.state);
		}
	
		// callback
		if (callback != null && typeof callback === 'function') {
			componentStateBoundary(this, callback, 1, null);
		}
	}
	
	
	/**
	 * Component class
	 *
	 * @public
	 * 
	 * @param {Object<string, any>=} props
	 */
	function Component (props) {
		// initial props
		if (this.getInitialProps !== void 0) {
			props = this.props = (
				componentDataBoundary(
					this, 
					'getInitialProps', 
					(props = (props === objEmpty ? {} : props) || {}) || props)
			);
	
			this['--async'] = (
				props != null && props.constructor !== Object && typeof props.then === 'function'
			) ? true : false;
		}
		else {
			// assign props
			if (props !== objEmpty) {
				// hydrate default props
				if (this.getDefaultProps !== void 0) {
					assignDefaultProps(componentDataBoundary(this, 'getDefaultProps', props), props);
				}
				
				if (this.componentWillReceiveProps !== void 0) {
					componentPropsBoundary(this, props);
				}
	
				this.props = props;
			} 
			// default props
			else {
				this.props = (
					this.props || 
					(this.getDefaultProps !== void 0 && componentDataBoundary(this, 'getDefaultProps', null)) || 
					{}
				);
			}
	
			this['--async'] = false;
		}
	
		// assign state
		this.state = (
			this.state || 
			(this.getInitialState !== void 0 && componentDataBoundary(this, 'getInitialState', null)) || 
			{}
		);
	
		this.refs = null;
	
		this['--vnode'] = null;
		this['--yield'] = false;
		this['--throw'] = 0;
	}
	
	
	/**
	 * Component prototype
	 * 
	 * @type {Object<string, function>}
	 */
	Component.prototype = Object.create(null, {
		setState: {value: setState},
		forceUpdate: {value: forceUpdate}
	});
	
	
	/**
	 * create class
	 *
	 * @public
	 * 
	 * @param  {(Object<string, any>|function(createElement): (Object<string, any>|function))} subject
	 * @param  {Object<string, any>=} props
	 * @return {function(new:Component, Object<string, any>)}
	 */
	function createClass (subject, props) {
		// empty class
		if (subject == null) {
			subject = createEmptyShape();
		}
	
		// component cache
		if (subject.COMPCache !== void 0) {
			return subject.COMPCache;
		}
	
		// is function?
		var func = typeof subject === 'function';
	
		// extract shape of component
		var shape = func ? (subject(createElement) || createEmptyShape()) : subject;	
		var type = typeof shape === 'function' ? 2 : (shape.Type != null ? 1 : 0);
		var construct = false;
		
		var vnode;
		var constructor;
		var render;
	
		// numbers, strings, arrays
		if (type !== 2 && shape.constructor !== Object && shape.render === void 0) {
			shape = extractVirtualNode(shape, {props: props});
		}
	
		// elements/functions
		if (type !== 0) {
			// render method
			render = type === 1 ? (vnode = shape, function () { return vnode; }) : shape;
	
			// new shape
			shape = { render: render };
		}
		else {
			if (construct = shape.hasOwnProperty('constructor')) {
				constructor = shape.constructor
			}
	
			// create render method if one does not exist
			if (typeof shape.render !== 'function') {
				shape.render = function () { return createEmptyShape(); };
			}
		}
	
		// create component class
		function component (props) {
			// constructor
			if (construct) {
				constructor.call(this, props);
			}
	
			// extend Component
			Component.call(this, props); 
		}
	
		// extends shape
		component.prototype = shape;
	
		// extends Component class
		shape.setState = Component.prototype.setState;
		shape.forceUpdate = Component.prototype.forceUpdate;
		component.constructor = Component;
	
		// function shape, cache component
		if (func) {
			shape.constructor = subject;
			subject.COMPCache = component;
		}
	
		// stylesheet namespaced
		if (func || shape.stylesheet !== void 0) {
			// displayName / function name / random string
			shape.displayName = (
				shape.displayName || 
				(func ? subject.name : false) || 
				((Math.random()+1).toString(36).substr(2, 5))
			);
		}
	
		return component;
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * error boundries
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * mount error boundaries
	 *
	 * @param {Component} component
	 * @param {string}    method
	 * @param {Node}      DOMNode
	 */
	function componentMountBoundary (component, method, DOMNode) {	
		try {
			component[method](DOMNode);
		}
		catch (error) {
			componentErrorBoundary(error, component, method);
		}
	}
	
	
	/**
	 * update error boundaries
	 *
	 * @param  {Component} component
	 * @param  {string}    method
	 * @param  {Object}    newProps
	 * @param  {Object}    newState
	 * @return {boolean?}
	 */
	function componentUpdateBoundary (component, method, newProps, newState) {
		try {
			return component[method](newProps, newState);
		}
		catch (error) {
			componentErrorBoundary(error, component, method);
		}
	}
	
	
	/**
	 * state error boundaries
	 *
	 * @param {Component} component
	 * @param {function}  func
	 */
	function componentStateBoundary (component, func, location) {	
		try {
			return func.call(component);
		}
		catch (error) {
			componentErrorBoundary(error, component, location === 0 ? 'setState' : 'forceUpdate');
		}
	}
	
	
	/**
	 * props error boundaries
	 *
	 * @param {Component} component
	 * @param {Object}    props
	 */
	function componentPropsBoundary (component, props) {	
		try {
			component.componentWillReceiveProps(props);
		}
		catch (error) {
			componentErrorBoundary(error, component, 'componentWillReceiveProps');
		}
	}
	
	
	/**
	 * data error boundaries
	 *
	 * @param {Component} component
	 * @param {string}    method
	 * @param {Object}    props
	 */
	function componentDataBoundary (component, method, data) {	
		try {
			return component[method](data);
		}
		catch (error) {
			componentErrorBoundary(error, component, method);
		}
	}
	
	
	/**
	 * render error boundaries
	 *
	 * @param {Component} component
	 * @param {string}    type
	 * @param {string}    name
	 * @param {Error}     error
	 */
	function componentRenderBoundary (component, type, name, error) {
		return componentErrorBoundary(
			'Encountered an unsupported ' + type + ' type `'+ name + '`.\n\n' + error,
			component, 
			type
		);
	}
	
	
	/**
	 * generate error
	 *
	 * @param {string|Error} error
	 * @param {Component}    component
	 * @param {string}       location
	 * @param {Error}
	 */
	function componentErrorBoundary (error, component, location) {
		if (component == null) {
			return;
		}
	
		var newNode;
		var oldNode;
		var displayName;
		var authored;
		var thrown = component['--throw'];
	
		component['--throw'] = thrown + 1;
	
		if ((error instanceof Error) === false) {
			error = new Error(error);
		}
	
		// initial throw from render, try to recover once
		if (thrown === 0 && browser && location === 'render') {
			schedule(function () {
	            try {
	                // test render for errors
	                component.render(component.props, component.state, component);
	
	                // update if no errors where thrown
	                component.forceUpdate();
	            }
	            catch (e) {
	                
	            }
			});
		}
	
		// second throw, failed to recover the first time
		if (thrown !== 0 && location === 'render') {
			return;
		}
	
		authored = typeof component.componentDidThrow === 'function';
		displayName = component.displayName || component.constructor.name;
	
		// define error
		Object.defineProperties(error, {
			silence: {value: false, writable: true},
			location: {value: location}, 
			from: {value: displayName}
		});
	
		// authored error handler
	    if (authored) {
	    	try {
	    		newNode = component.componentDidThrow(error);
	    	}
	    	catch (e) {    		
	    		// avoid recursive call stack
	    		if (thrown >= 0) {
	    			// preserve order of errors logged 
	    			schedule(function () {
	    				component['--throw'] = -1;
	    				componentErrorBoundary(e, component, 'componentDidThrow');
	    			});
	    		}
	    	}
	    }
	
	    if (error.silence !== true) {
	    	// default error handler
	    	console.error(
	          'Dio caught an error thrown by ' + 
	          (displayName ? '`' + displayName + '`' : 'one of your components') + 
	          ', the error was thrown in `' + location + '`.' + 
	          '\n\n' + error.stack.replace(/\n+/, '\n\n')
	        );
	    }
	
	    if (authored && location !== 'stylesheet') {	    	
	    	// return render node
	    	if (location === 'render' || location === 'element') {
	    		if (newNode != null && typeof newNode.type === 'string') {
	    			if (/^[A-z]/g.exec(newNode.type) === null) {
						console.error(
							'Dio bailed out of rendering an error state for `' + displayName + '`.\n\n'+
							'Reason: `componentDidThrow` returned an invalid element `'+ newNode.type +'`'
						);
	
	    				return;
	    			}
	
	    			newNode.type = newNode.type.replace(/ /g, '');
	    		}
	
	    		return newNode;
	    	}
	    	// async replace render node
	    	else if (browser && newNode != null && newNode !== true && newNode !== false) {
	    		schedule(function () {
	    			replaceRootNode(
	    				extractVirtualNode(newNode), 
	    				oldNode = component['--vnode'], 
	    				newNode.Type, 
	    				oldNode.Type, 
	    				component
					)
	    		});
	    	}
	    }
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * extract
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * extract component
	 * 
	 * @param  {VNode}      subject
	 * @param  {Component?} instance
	 * @param  {VNode?}     parent
	 * @return {VNode} 
	 */
	function extractComponentNode (subject, instance, parent) {
		/** @type {Component} */
		var owner;
	
		/** @type {(Component|function(new:Component, Object<string, any>))} */
		var type = subject.type;
	
		/** @type {Object<string, any>} */
		var props = subject.props;
	
		// default props
		if (type.defaultProps !== void 0) {
			// clone default props if props is not an empty object, else use defaultProps as props
			props !== objEmpty ? assignDefaultProps(type.defaultProps, props) : (props = type.defaultProps);
		}
	
		// assign children to props if not empty
		if (subject.children.length !== 0) {
			// prevents mutating the empty object constant
			if (props === objEmpty) {
				props = {children: subject.children};
			}
			else {
				props.children = subject.children;			
			}
		}
		
		// cached component
		if (type.COMPCache !== void 0) {
			owner = type.COMPCache;
		} 
		// function components
		else if (type.constructor === Function && (type.prototype === void 0 || type.prototype.render === void 0)) {
			// create component
			owner = createClass(type, props);
		}
		// class / createClass components
		else {
			owner = type;
		}
	
		// create component instance
		var component = subject.instance = new owner(props);
		
		// retrieve vnode
		var vnode = extractRenderNode(component);
	
		// if render returns a component, extract component recursive
		if (vnode.Type === 2) {
			vnode = extractComponentNode(vnode, component, parent || subject);
		}
	
		// if keyed, assign key to vnode
		if (subject.key !== void 0 && vnode.key === void 0) {
			vnode.key = subject.key;
		}
	
		// replace props and children
		subject.props = vnode.props
		subject.children = vnode.children;
	
		// recursive component
		if (instance !== null) {
			component['--vnode'] = parent;
		}
		else {
			component['--vnode'] = subject;
			
			subject.nodeName = vnode.type;
		}
	
		return vnode;
	}
	
	
	/**
	 * extract a render function
	 *
	 * @param  {Component} component
	 * @return {VNode}
	 */
	function extractRenderNode (component) {
		try {
			// async render
			if (component['--async'] === true) {			
				if (browser) {
					component.props.then(function resolveAsyncClientComponent (props) {
						component.props = props;
						component.forceUpdate();
					}).catch(funcEmpty);
					
					component['--async'] = false;
				}
	
				return createEmptyShape();
			}
			// generator
			else if (component['--yield']) {
				return extractVirtualNode(
					component.render.next().value, 
					component
				);
			}
			// sync render
			else {
				return extractVirtualNode(
					component.render(component.props, component.state, component), 
					component
				);
			}
		}
		// error thrown
		catch (error) {
			return componentErrorBoundary(error, component, 'render') || createEmptyShape();
		}
	}
	
	
	/**
	 * render to virtual node
	 * 
	 * @param  {(VNode|function|Component)} subject
	 * @param  {Component}                  component
	 * @return {VNode}
	 */
	function extractVirtualNode (subject, component) {
		// empty
		if (subject == null) {
			return createEmptyShape();
		}
	
		// element
		if (subject.Type !== void 0) {
			return subject;
		}
	
		// portal
		if (subject.nodeType !== void 0) {	
			return (
				subject = createPortalShape(subject, objEmpty, arrEmpty), 
				subject.Type = 5, 
				subject
			);
		}
		
		switch (subject.constructor) {
			// component
			case Component: {
				return createComponentShape(subject, objEmpty, arrEmpty);
			}
			// booleans
			case Boolean: {
				return createEmptyShape();
			}
			// fragment
			case Array: {
				return createElement('@', null, subject);
			}
			// string/number
			case String: case Number: {
				return createTextShape(subject);
			}
			// component/function
			case Function: {
				// stream
				if (subject.then != null && typeof subject.then === 'function') {
					if (subject['--listening'] !== true) {
						subject.then(function resolveStreamComponent () {
							component.forceUpdate();
						}).catch(funcEmpty);
	
						subject['--listening'] = true;
					}
	
					return extractVirtualNode(subject(), component);
				}
				// component
				else if (subject.prototype !== void 0 && subject.prototype.render !== void 0) {
					return createComponentShape(subject, objEmpty, arrEmpty);
				}
				// function
				else {
					return extractVirtualNode(subject((component && component.props) || {}), component);
				}
			}
			// promise
			case Promise: {
				if (browser) {
					subject.then(function resolveAsyncComponent (newNode) {
						replaceRootNode(
							extractVirtualNode(newNode), 
							subject = component['--vnode'], 
							newNode.Type, 
							subject.Type, 
							component
						);
					}).catch(funcEmpty);
				}
				else {
					component['--async'] = subject;
				}
	
				return createEmptyShape();
			}
		}
	
		// coroutine
		if (typeof subject.next === 'function' || (subject.prototype != null && subject.prototype.next != null)) {			
			if (subject.return == null) {
				subject = subject(component.props, component.state, component);
			}
	
			component['--yield'] = true;
			component.render = subject;
	
			component.constructor.prototype.render = function render () {
				return subject.next().value;
			};
	
			return extractVirtualNode(subject.next().value, component);
		}
		// component descriptor
		else if (typeof subject.render === 'function') {
			return (
				subject.COMPCache || 
				createComponentShape(subject.COMPCache = createClass(subject, null), objEmpty, arrEmpty)
			);
		} 
		// unsupported render types, fail gracefully
		else {
			return componentRenderBoundary(
				component,
				'render', 
				subject.constructor.name, 
				''
			) || createEmptyShape();
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * render
	 * 
	 * ---------------------------------------------------------------------------------
	 */
		
	
	/**
	 * render
	 *
	 * @public
	 * 
	 * @param  {(Component|VNode|function|Object<string, any>)} subject
	 * @param  {(Node|string)=}                                 target
	 * @param  {function(this:Component, Node)=}                callback
	 * @param  {boolean=}                                       hydration
	 * @return {function(Object=)}
	 */
	function render (subject, target, callback, hydration) {
		var initial = true;
		var nodeType = 2;
		
		var component;	
		var vnode;
		var element;
		
		// renderer
		function renderer (newProps) {
			if (initial) {
				// dispatch mount
				appendNode(nodeType, vnode, element, createNode(vnode, null, null));
	
				// register mount has been dispatched
				initial = false;
	
				// assign component instance
				component = vnode.instance;
			}
			else {
				// update props
				if (newProps !== void 0) {
					// component with shouldComponentUpdate
					if (
						component.shouldComponentUpdate !== void 0 && 
						componentUpdateBoundary(component, 'shouldComponentUpdate', newProps, component.state) === false
					) {
						// exit early
						return renderer;
					}
	
					component.props = newProps;
				}
	
				// update component
				component.forceUpdate();
			}
	
			return renderer;
		}
	
		// exit early
		if (browser === false) {
			return renderer;
		}
	
		// Object
		if (subject.render !== void 0) {
			vnode = createComponentShape(createClass(subject, null), objEmpty, arrEmpty);
		}
		// array/component/function
		else if (subject.Type === void 0) {
			// array
			if (subject.constructor === Array) {
				vnode = createElement('@', null, subject);
			}
			// component/function
			else {
				vnode = createComponentShape(subject, objEmpty, arrEmpty);
			}
		} 
		// element/component
		else {
			vnode = subject;
		}
	
		// element
		if (vnode.Type !== 2) {
			vnode = createComponentShape(createClass(vnode, null), objEmpty, arrEmpty);
		}
	
		// mount
	  	if (target != null && target.nodeType != null) {
	  		// target is a dom element
	  		element = target === document ? docuemnt.body : target;
		} 
		else {
	  		// selector
	  		target = document.querySelector(target);
	
	  		// default to document.body if no match/document
	  		element = (target === null || target === document) ? document.body : target;
		}
	
		// hydration
		if (hydration != null && hydration !== false) {
			// dispatch hydration
			hydrate(element, vnode, typeof hydration === 'number' ? hydration : 0, null, null);
	
			// register mount has been dispatched
			initial = false;
	
			// assign component
			component = vnode.instance;
		} 
		else {
			// destructive mount
			hydration === false && (element.textContent = '');
			
			renderer();
		}
	
		// if present call root components context, passing root node as argument
		if (callback && typeof callback === 'function') {
			callback.call(component, vnode.DOMNode || target);
		}
	
		return renderer;
	}
	
	
	/**
	 * shallow render
	 *
	 * @public
	 * 
	 * @param  {(VNode|Component|function)}
	 * @return {VNode}
	 */
	function shallow (subject) {
		if (isValidElement(subject)) {
			return subject.Type === 2 ? extractComponentNode(subject, null, null) : subject;
		}
		else {
			return extractComponentNode(createElement(subject, null, null), null, null);
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * props
	 * 
	 * ---------------------------------------------------------------------------------
	 */
		
	
	/**
	 * assign prop for create element
	 * 
	 * @param  {Node}       target
	 * @param  {Object}     props
	 * @param  {boolean}    onlyEvents
	 * @param  {Component}  component
	 */
	function assignProps (target, props, onlyEvents, component) {
		for (var name in props) {
			var value = props[name];
	
			// refs
			if (name === 'ref' && value != null) {
				refs(value, component, target);
			}
			// events
			else if (isEventProp(name)) {
				addEventListener(target, name.substring(2).toLowerCase(), value, component);
			}
			// attributes
			else if (onlyEvents === false && name !== 'key' && name !== 'children') {
				// add attribute
				updateProp(target, true, name, value, props.xmlns);
			}
		}
	}
	
	
	/**
	 * patch props
	 * 
	 * @param  {VNode} newNode
	 * @param  {VNode} oldNode
	 */
	function patchProps (newNode, oldNode) {
		var newProps = newNode.props;
		var oldProps = oldNode.props;
		var namespace = newNode.props.xmlns || '';
		var target = oldNode.DOMNode;
		var updated = false;
		var length = 0;
	
		// diff newProps
		for (var newName in newNode.props) {
			length = newName.length;
	
			if (
				(length === 3 && newName === 'key') === false && 
				(length === 8 && newName === 'children') === false && 
				isEventProp(newName) === false
			) {
				var newValue = newProps[newName];
				var oldValue = oldProps[newName];
	
				if (newValue != null && oldValue !== newValue) {
					updateProp(target, true, newName, newValue, namespace);
					
					if (updated === false) {
						updated = true;
					}
				}
			}
		}
	
		// diff oldProps
		for (var oldName in oldNode.props) {
			length = oldName.length;
	
			if (
				(length === 3 && oldName === 'key') === false && 
				(length === 8 && oldName === 'children') === false &&  
				isEventProp(oldName) === false
			) {
				var newValue = newProps[oldName];
	
				if (newValue == null) {
					updateProp(target, false, oldName, '', namespace);
					
					if (updated === false) {
						updated = true;
					}
				}
			}
		}
	
		if (updated) {
			oldNode.props = newNode.props;
		}
	}
	
	
	/**
	 * assign/update/remove prop
	 * 
	 * @param  {Node}    target
	 * @param  {boolean} set
	 * @param  {string}  name
	 * @param  {any}     value
	 * @param  {string}  namespace
	 */
	function updateProp (target, set, name, value, namespace) {
		var length = name.length;
	
		// avoid xmlns namespaces
		if (length > 22 && (value === nsSvg || value === nsMath)) {
			return;
		}
	
		// if xlink:href set, exit, 
		if (length === 10 && name === 'xlink:href') {
			target[(set ? 'set' : 'remove') + 'AttributeNS'](nsXlink, 'href', value);
			return;
		}
	
		var svg = false;
	
		// svg element, default to class instead of className
		if (namespace === nsSvg) {
			svg = true;
	
			if (length === 9 && name === 'className') {
				name = 'class';
			}
			else {
				name = name;
			}
		}
		// html element, default to className instead of class
		else {
			if (length === 5 && name === 'class') {
				name = 'className';
			}
		}
	
		var destination = target[name];
		var defined = value != null && value !== false;
	
		// objects
		if (defined && typeof value === 'object') {
			destination === void 0 ? target[name] = value : updatePropObject(name, value, destination);
		}
		// primitives `string, number, boolean`
		else {
			// id, className, style, etc..
			if (destination !== void 0 && svg === false) {
				if (length === 5 && name === 'style') {
					target.style.cssText = value;
				}
				else {
					target[name] = value;
				}
			}
			// set/remove Attribute
			else {
				if (defined && set) {
					// assign an empty value with boolean `true` values
					target.setAttribute(name, value === true ? '' : value);
				}
				else {
					// removes attributes with false/null/undefined values
					target.removeAttribute(name);
				}
			}
		}
	}
	
	
	/**
	 * check if a name is an event-like name, i.e onclick, onClick...
	 * 
	 * @param  {string} name
	 * @return {boolean}
	 */
	function isEventProp (name) {
		return name.charCodeAt(0) === 111 && name.charCodeAt(1) === 110 && name.length > 3;
	}
	
	
	/**
	 * update prop objects, i.e .style
	 *
	 * @param {string} parent
	 * @param {Object} prop
	 * @param {Object} target
	 */
	function updatePropObject (parent, prop, target) {
		for (var name in prop) {
			var value = prop[name] || null;
	
			// assign if target object has property
			if (name in target) {
				target[name] = value;
			}
			// style properties that don't exist on CSSStyleDeclaration
			else if (parent === 'style') {
				// assign/remove
				value ? target.setProperty(name, value, null) : target.removeProperty(name);
			}
		}
	}
	
	
	/**
	 * assign default props
	 * 
	 * @param  {Object<string, any>} defaultProps
	 */
	function assignDefaultProps (defaultProps, props) {
		for (var name in defaultProps) {
			props[name] = props[name] || defaultProps[name];
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * nodes
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * create DOMNode
	 *
	 * @param {number}    type
	 * @param {Component} component
	 */
	function createDOMNode (type, component) {
		try {
			return document.createElement(type);
		} 
		catch (error) {
			return createDOMNodeError(
				componentRenderBoundary(component, 'element', type, error),
				component
			);
		}
	}
	
	
	/**
	 * create namespaced DOMNode
	 *
	 * @param {namespace} namespace
	 * @param {number}    type
	 * @param {Componnet} component
	 */
	function createDOMNodeNS (namespace, type, component) {
		try {
			return document.createElementNS(namespace, type);
		}
		catch (error) {
			return createDOMNodeError(
				componentRenderBoundary(component, 'element', type, error),
				component
			);
		}
	}
	
	
	/**
	 * create error state DOMNode
	 * 
	 * @param  {VNode}      vnode
	 * @param  {Component?} component
	 * @return {Node}
	 */
	function createDOMNodeError (vnode, component) {
		// empty, null/undefined
		if (vnode == null) {
			return createNode(createEmptyShape(), null, null);
		}
		// string, number, element, array
		else {
			return createNode(createElement('@', null, vnode), component, null);
		}
	}
	
	
	/**
	 * create node
	 * 
	 * @param  {VNode}      subject
	 * @param  {Component?} component
	 * @param  {string?}    namespace
	 * @return {Node}
	 */
	function createNode (subject, component, namespace) {
		var nodeType = subject.Type;
	
		// create text node element	
		if (nodeType === 3) {
			return subject.DOMNode = document.createTextNode(subject.children);
		}
	
		var vnode;
		var element;
	
		var portal = false;
	
		// DOMNode exists
		if (subject.DOMNode !== null) {
			element = subject.DOMNode;
	
			// portal
			if (portal = (nodeType === 4 || nodeType === 5)) {
				element = (vnode = subject).DOMNode = (nodeType === 4 ? element.cloneNode(true) : element);
			}
			// hoisted
			else {
				return subject.DOMNode = element.cloneNode(true);
			}
		}
		// create DOMNode
		else {
			vnode = nodeType === 2 ? extractComponentNode(subject, null, null) : subject;
		}
		
		var Type = vnode.Type;
		var children = vnode.children;
	
		if (portal === false) {
			// text		
			if (Type === 3) {
				return vnode.DOMNode = subject.DOMNode = document.createTextNode(children);
			}
			// portal
			else if (Type === 4 || Type === 5) {
				element = vnode.DOMNode;
				portal = true;
			}
		}
	
		var type = vnode.type;
		var props = vnode.props;
		var length = children.length;
	
		var instance = subject.instance !== null;
		var thrown = 0;
	
		// assign namespace
		if (props.xmlns !== void 0) { 
			namespace = props.xmlns; 
		}
	
		// has a component instance, hydrate component instance
		if (instance) {
			component = subject.instance;
			thrown = component['--throw'];
		}
	
		if (portal === false) {
			// create namespaced element
			if (namespace !== null) {
				// if undefined, assign svg namespace
				if (props.xmlns === void 0) {
					props === objEmpty ? (props = {xmlns: namespace}) : (props.xmlns = namespace);
				}
	
				element = createDOMNodeNS(namespace, type, component);
			}
			// create html element
			else {
				element = createDOMNode(type, component);
			}
	
			vnode.DOMNode = subject.DOMNode = element;
		}
	
		if (instance) {
			// avoid appending children if an error was thrown while creating a DOMNode
			if (thrown !== component['--throw']) {
				return vnode.DOMNode = subject.DOMNode = element;
			}
	
			vnode = component['--vnode'];
	
			// hydrate
			if (vnode.DOMNode === null) {
				vnode.DOMNode = element;
			}
	
			// stylesheets
			if (nodeType === 2 && component.stylesheet !== void 0 && type !== 'noscript' && type !== '#text') {
				createScopedStylesheet(component, subject.type, element);
			}
		}
	
		// has children
		if (length !== 0) {
			// append children
			for (var i = 0; i < length; i++) {
				var newChild = children[i];
	
				// hoisted, clone
				if (newChild.DOMNode !== null) {
					newChild = children[i] = cloneNode(newChild);
				}
	
				// append child
				appendNode(newChild.Type, newChild, element, createNode(newChild, component, namespace));
			}
		}
	
		// has props
		if (props !== objEmpty) {
			// props and events
			assignProps(element, props, false, component);
		}
	
		// cache DOM reference
		return element;
	}
	
	
	/**
	 * append node
	 *
	 * @param {number} newType
	 * @param {VNode}  newNode
	 * @param {Node}   parentNode
	 * @param {Node}   nextNode
	 */
	function appendNode (newType, newNode, parentNode, nextNode) {
		// lifecycle, componentWillMount
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
			componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
		}
	
		// append element
		parentNode.appendChild(nextNode);
	
		// lifecycle, componentDidMount
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
			componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
		}
	}
	
	
	/**
	 * insert node
	 *
	 * @param {number} newType
	 * @param {VNode}  newNode
	 * @param {Node}   prevNode
	 * @param {Node}   parentNode
	 * @param {Node}   nextNode
	 */
	function insertNode (newType, newNode, prevNode, parentNode, nextNode) {
		// lifecycle, componentWillMount
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
			componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
		}
	
		// insert element
		parentNode.insertBefore(nextNode, prevNode);
	
		// lifecycle, componentDidMount
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
			componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
		}
	}
	
	
	/**
	 * remove node
	 *
	 * @param {number} oldType
	 * @param {VNode}  oldNode
	 * @param {Node}   parentNode
	 */
	function removeNode (oldType, oldNode, parentNode) {
		// lifecycle, componentWillUnmount
		if (oldType === 2 && oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
			componentMountBoundary(oldNode.instance, 'componentWillUnmount', oldNode.DOMNode);
		}
	
		// remove element
		parentNode.removeChild(oldNode.DOMNode);
	
		// clear references
		oldNode.DOMNode = null;
	}
	
	
	/**
	 * empty node
	 *
	 * @param {VNode}  oldNode
	 * @param {number} oldLength
	 */
	function emptyNode (oldNode, oldLength) {
		var children = oldNode.children;	
		var parentNode = oldNode.DOMNode;
		var oldChild;
	
		// umount children
		for (var i = 0; i < oldLength; i++) {
			oldChild = children[i];
			
			// lifecycle, componentWillUnmount
			if (oldChild.Type === 2 && oldChild.instance !== null && oldChild.instance.componentWillUnmount) {
				componentMountBoundary(oldChild.instance, 'componentWillUnmount', oldChild.DOMNode);
			}
	
			// clear references
			oldChild.DOMNode = null;
		}
	
		parentNode.textContent = '';
	}
	
	
	/**
	 * replace node
	 *
	 * @param {VNode} newType
	 * @param {VNode} oldType
	 * @param {VNode} newNode
	 * @param {VNode} oldNode
	 * @param {Node}  parentNode 
	 * @param {Node}  nextNode
	 */
	function replaceNode (newType, oldType, newNode, oldNode, parentNode, nextNode) {
		// lifecycle, componentWillUnmount
		if (oldType === 2 && oldNode.instance !== null && oldNode.instance.componentWillUnmount) {
			componentMountBoundary(oldNode.instance, 'componentWillUnmount', oldNode.DOMNode);
		}
	
		// lifecycle, componentWillMount
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentWillMount) {
			componentMountBoundary(newNode.instance, 'componentWillMount', nextNode);
		}
	
		// replace element
		parentNode.replaceChild(nextNode, oldNode.DOMNode);
			
		// lifecycle, componentDidmount
		if (newType === 2 && newNode.instance !== null && newNode.instance.componentDidMount) {
			componentMountBoundary(newNode.instance, 'componentDidMount', nextNode);
		}
	
		// clear references
		oldNode.DOMNode = null;
	}
	
	
	/**
	 * replace root node
	 * 
	 * @param  {VNode}     newNode
	 * @param  {VNode}     oldNode
	 * @param  {number}    newType
	 * @param  {number}    oldType
	 * @param  {Component} component
	 */
	function replaceRootNode (newNode, oldNode, newType, oldType, component) {
		var refDOMNode = oldNode.DOMNode;
		var newProps = newNode.props;
	
		// replace node
		refDOMNode.parentNode.replaceChild(createNode(newNode, component, null), refDOMNode);
	
		// hydrate new node
		oldNode.props = newProps;
		oldNode.nodeName = newNode.nodeName || newNode.type;
		oldNode.children = newNode.children;
		oldNode.DOMNode = newNode.DOMNode;
	
	 	// // stylesheet
	 	if (newType !== 3 && component.stylesheet !== void 0) {
	 		createScopedStylesheet(component, component.constructor, newNode.DOMNode);
	 	}
	}	
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * events
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * add event listener
	 *
	 * @param {Node}            element
	 * @param {string}          name
	 * @param {function|Object} listener
	 * @param {Component}       component
	 */
	function addEventListener (element, name, listener, component) {
		// default listener
		if (typeof listener === 'function') {
			element.addEventListener(name, listener, false);
		}
		// non-default listener
		else {
			element.addEventListener(name, bindEvent(name, listener, component), listener.options || false);
		}
	}
	
	
	/**
	 * bind event
	 *
	 * @param  {string}              name
	 * @param  {Object<string, any>} value
	 * @param  {Component}           component
	 * @return {function}
	 */
	function bindEvent (name, value, component) {
		var bind = value.bind || value.handler;
		var data = value.with || value.data;
		var preventDefault = value.preventDefault === true || (!value.options && value.preventDefault === void 0);
	
		if (typeof bind === 'object') {
			var property = bind.property || data;
	
			return function (event) {
				var target = event.currentTarget || event.target;
				var value = data in target ? target[data] : target.getAttribute(data);
	
				preventDefault && event.preventDefault();
	
				// update component state
				component.state[property] = value;
	
				// update component
				component.forceUpdate();
			}
		} 
		else {
			return function (event) {
				preventDefault && event.preventDefault();
				bind.call(data, data, event);
			}
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * refs
	 * 
	 * ---------------------------------------------------------------------------------
	 */
		
	
	/**
	 * refs
	 *
	 * @param {(string|function(Node))} ref
	 * @param {Component}               component
	 * @param {Node}                    element
	 */
	function refs (ref, component, element) {
		if (typeof ref === 'function') {
			ref.call(component, element);
		}
		else {
			(component.refs = component.refs || {})[ref] = element;
		}
	}
	
	
	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * reconcile
	 * 
	 * ---------------------------------------------------------------------------------
	 */
	
	
	/**
	 * reconcile keyed nodes
	 *
	 * @param {Object<string, any>}    newKeys
	 * @param {Object<string, any>}    oldKeys
	 * @param {Node}                   parentNode
	 * @param {VNode}                  newNode
	 * @param {VNode}                  oldNode
	 * @param {number}                 newLength
	 * @param {number}                 oldLength
	 * @param {number}                 position
	 * @param {number}                 length
	 */
	function reconcileKeys (newKeys, oldKeys, parentNode, newNode, oldNode, newLength, oldLength, position, length) {
		var reconciled = new Array(newLength);
	
		// children
		var newChildren = newNode.children;
		var oldChildren = oldNode.children;
	
		// child nodes
		var newChild;
		var oldChild;
	
		// DOM nodes
		var nextNode;
		var prevNode;
	
		// keys
		var key;
	
		// offsets
		var added = 0;
		var removed = 0;
		var i = 0;
		var index = 0;
		var offset = 0;
		var moved = 0;
	
		// reconcile leading nodes
		if (position !== 0) {
			for (; i < position; i++) {
				reconciled[i] = oldChildren[i];
			}
		}
	
		// reconcile trailing nodes
		for (i = 0; i < length; i++) {
			newChild = newChildren[index = (newLength-1)-i];
			oldChild = oldChildren[(oldLength-1)-i];
	
			if (newChild.key === oldChild.key) {
				reconciled[index] = oldChild;
	
				// trim trailing node
				length--;
			}
			else {
				break;
			}
		}
	
		// reconcile inverted nodes
		if (newLength === oldLength) {
			for (i = position; i < length; i++) {
				newChild = newChildren[index = (newLength-1)-i];
				oldChild = oldChildren[i];
	
				if (index !== i && newChild.key === oldChild.key) {		
					newChild = oldChildren[index];
	
					nextNode = oldChild.DOMNode;
					prevNode = newChild.DOMNode;
	
					// adjacent nodes
					if (index - i === 1) {
						parentNode.insertBefore(prevNode, nextNode);
					}
					else {
						// move first node to inverted postion
						parentNode.insertBefore(nextNode, prevNode);
	
						nextNode = prevNode;
						prevNode = oldChildren[i + 1].DOMNode;
	
						// move second node to inverted position
						parentNode.insertBefore(nextNode, prevNode);
					}
	
					// trim leading node
					position = i;
	
					// trim trailing node
					length--;
	
					// hydrate
					reconciled[i] = newChild;
					reconciled[index] = oldChild;
				}
				else {			
					break;
				}
			}
	
			// single remaining node
			if (length - i === 1) {
				reconciled[i] = oldChildren[i];
				oldNode.children = reconciled;
	
				return;
			}
		}
	
		// reconcile remaining node
		for (i = position; i < length; i++) {
			// old children
			if (i < oldLength) {
				oldChild = oldChildren[i];
				newChild = newKeys[oldChild.key];
	
				if (newChild === void 0) {
					removeNode(oldChild.Type, oldChild, parentNode);
					removed++;
				}
			}
	
			// new children
			if (i < newLength) {
				newChild = newChildren[i];
				oldChild = oldKeys[newChild.key];
	
				// new
				if (oldChild === void 0) {
					nextNode = createNode(newChild, null, null);
	
					// insert
					if (i < oldLength + added) {
						insertNode(
							newChild.Type, 
							newChild, 
							oldChildren[i - added].DOMNode, 
							parentNode, 
							nextNode
						);
					}
					// append
					else {
						appendNode(
							newChild.Type, 
							newChild, 
							parentNode, 
							nextNode
						);
					}
	
					reconciled[i] = newChild;
					added++;
				}
				// old
				else {
					index = oldChild.index;
					offset = index - removed;
	
					// moved
					if (offset !== i) {
						key = oldChildren[offset].key;
	
						// not moving to a removed index
						if (newKeys[key] !== void 0) {
							offset = i - added;
	
							// not identical keys
							if (newChild.key !== oldChildren[offset].key) {
								nextNode = oldChild.DOMNode;
								prevNode = oldChildren[offset - (moved++)].DOMNode;
	
								if (prevNode !== nextNode) {
									parentNode.insertBefore(nextNode, prevNode);
								}
							}
						}					
					}
	
					reconciled[i] = oldChild;
				}
			}
		}
	
		oldNode.children = reconciled;
	}
	
	
	/**
	 * reconcile nodes
	 *  
	 * @param  {VNode}  newNode
	 * @param  {VNode}  oldNode
	 * @param  {number} newNodeType
	 * @param  {number} oldNodeType
	 */
	function reconcileNodes (newNode, oldNode, newNodeType, oldNodeType) {	
		// if newNode and oldNode, exit early
		if (newNode === oldNode) {
			return;
		}
	
		// extract node from possible component node
		var currentNode = newNodeType === 2 ? extractComponentNode(newNode, null, null) : newNode;
		
		// a component
		if (oldNodeType === 2) {
			// retrieve components
			var oldComponent = oldNode.instance;
			var newComponent = newNode.instance;
	
			// retrieve props
			var newProps = newComponent.props;
			var newState = newComponent.state;
	
			// component with shouldComponentUpdate
			if (
				oldComponent.shouldComponentUpdate !== void 0 && 
				componentUpdateBoundary(oldComponent, 'shouldComponentUpdate', newProps, newState) === false
			) {
				// exit early
				return;
			}
	
			// component with componentWillUpdate
			if (oldComponent.componentWillUpdate !== void 0) {
				componentUpdateBoundary(oldComponent, 'componentWillUpdate', newProps, newState);
			}
		}
	
		// children
		var newChildren = currentNode.children;
		var oldChildren = oldNode.children;
	
		// children length
		var newLength = newChildren.length;
		var oldLength = oldChildren.length;
	
		// no children
		if (newLength === 0) {
			// remove all children if old children is not already cleared
			if (oldLength !== 0) {
				emptyNode(oldNode, oldLength);
				oldNode.children = newChildren;
			}
		}
		// has children
		else {
			// new node has children
			var parentNode = oldNode.DOMNode;
	
			// when keyed, the position that dirty keys begin
			var position = 0;
	
			// non-keyed until the first dirty key is found
			var keyed = false;
	
			// un-initialized key hash maps
			var oldKeys;
			var newKeys;
	
			var newKey;
			var oldKey;
	
			// the highest point of interest
			var length = newLength > oldLength ? newLength : oldLength;
	
			// children nodes
			var newChild;
			var oldChild;
	
			// children types
			var newType;
			var oldType;
	
			// for loop, the end point being which ever is the 
			// greater value between new length and old length
			for (var i = 0; i < length; i++) {
				// avoid accessing out of bounds index and Type where unnecessary
				newType = i < newLength ? (newChild = newChildren[i]).Type : (newChild = nodeEmpty, 0);
				oldType = i < oldLength ? (oldChild = oldChildren[i]).Type : (oldChild = nodeEmpty, 0);
	
				if (keyed) {				
					// push keys
					if (newType !== 0) {
						newKeys[newChild.key] = (newChild.index = i, newChild);
					}
	
					if (oldType !== 0) {
						oldKeys[oldChild.key] = (oldChild.index = i, oldChild);
					}
				}
				// remove
				else if (newType === 0) {
					removeNode(oldType, oldChildren.pop(), parentNode);
	
					oldLength--;
				}
				// add
				else if (oldType === 0) {
					appendNode(
						newType, 
						oldChildren[oldLength++] = newChild, 
						parentNode, 
						createNode(newChild, null, null)
					);
				}
				// text
				else if (newType === 3 && oldType === 3) {
					if (newChild.children !== oldChild.children) {
						oldChild.DOMNode.nodeValue = oldChild.children = newChild.children;
					}
				}
				// key
				else if ((newKey = newChild.key) !== (oldKey = oldChild.key)) {
					keyed = true;
					position = i;
	
					// map of key
					newKeys = {};
					oldKeys = {};
	
					// push keys
					newKeys[newKey] = (newChild.index = i, newChild);
					oldKeys[oldKey] = (oldChild.index = i, oldChild);
				}
				// replace
				else if (newChild.type !== oldChild.type) {
					replaceNode(
						newType, 
						oldType, 
						oldChildren[i] = newChild, 
						oldChild, 
						parentNode, 
						createNode(newChild, null, null)
					);
				}
				// noop
				else {
					reconcileNodes(newChild, oldChild, newType, oldType);
				}
			}
	
			// reconcile keyed children
			if (keyed) {
				reconcileKeys(
					newKeys, 
					oldKeys,
					parentNode, 
					newNode, 
					oldNode, 
					newLength, 
					oldLength, 
					position,
					length
				);
			}
		}
	
		// props objects of the two nodes are not equal, patch
		if (currentNode.props !== oldNode.props) {
			patchProps(currentNode, oldNode);
		}
	
		// component with componentDidUpdate
		if (oldNodeType === 2 && oldComponent.componentDidUpdate !== void 0) {
			componentUpdateBoundary(oldComponent, 'componentDidUpdate', newProps, newState);
		}
	}
	
	


	/**
	 * ---------------------------------------------------------------------------------
	 * 
	 * exports
	 * 
	 * ---------------------------------------------------------------------------------
	 */


	if (browser) {
		window.h = createElement;
	}

	return {
		// version
		version: version,

		// alias
		h: createElement,

		// elements
		createElement: createElement,
		isValidElement: isValidElement,
		cloneElement: cloneElement,
		createFactory: createFactory,
		DOM: DOM,

		// render
		render: render,
		shallow: shallow,

		// components
		Component: Component,
		createClass: createClass,

		// shapes
		text: createTextShape,
		element: createElementShape,
		svg: createSvgShape,
		fragment: createFragmentShape,
		component: createComponentShape,
		portal: createPortalShape,

		// stylesheet
		stylesheet: stylesheet
	};
}));