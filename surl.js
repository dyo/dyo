/**
 * Surl - Virtual Dom Library
 *
 * @author Sultan Tarimo <https://github.com/sultantarimo>
 */
(function () {
    'use strict';

    /* --------------------------------------------------------------
     * 
     * Core
     * 
     * -------------------------------------------------------------- */

    // polyfills
    (function () {
        /**
         * requestAnimationFrame Polyfill
         */
        
        // references
        var raf = 'requestAnimationFrame',
            caf = 'cancelAnimationFrame',
            v   = ['webkit', 'moz'],
            vl  = v.length,
            af  = 'AnimationFrame',
            lt = 0; 
            // last time

        // normalize vendors
        for (var x = 0; x < vl && !window[raf]; ++x) {
            window[raf] = window[v[x]+'Request'+af];
            window[caf] = window[v[x]+'Cancel'+af]||window[v[x]+'CancelRequest'+af]
        }

        // raf doesn't exist, polyfill it
        if (!window[raf]) {
            window[raf] = function(callback) {
                var currTime   = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lt)),
                    id         = window.setTimeout(function() { 
                                    callback(currTime + timeToCall); 
                                 }, timeToCall);

                    lt = currTime + timeToCall;

                return id
            };
        }

        if (!window[caf]) {
            window[caf] = function(id) {
                clearTimeout(id)
            }
        }
    }());

    // references
    var _c         = 'constructor',
        _namespace = {
            math: 'http://www.w3.org/1998/Math/MathML',
            svg: 'http://www.w3.org/2000/svg',
            xlink: 'http://www.w3.org/1999/xlink'
        };

    /**
     * 'forEach' shortcut
     * @param  {Array|Object} a 
     * @param  {Function}     b
     * @return {Array|Object}
     */
    function each (a, b) {
        var i;

        // Handle arrays
        if (a[_c] === Array) {
            var l = a.length;
                i = 0;

            for(; i < l; ++i) {
                if ( b.call(a[i], a[i], i, a) === false ) 
                    return a
            }
        }
        // Handle objects 
        else {
            for (i in a) {
                if ( b.call(a[i], a[i], i, a) === false ) 
                    return a
            }
        }

        return a
    }

    /**
     * requestAnimationFrame helper
     * @param  {Function} fn  - function to run on each frame update
     * @param  {Number}   fps - frames per second
     * @param  {Object}   raf - object to request animation frame reference
     */
    function raf (fn, fps, raf) {
        var then = new Date().getTime();
    
        // custom fps, otherwise fallback to 60
        fps = fps | 60;
        var interval = 1000 / fps;
    
        return (function loop(time) {
            raf.id = requestAnimationFrame(loop)

            var now = new Date().getTime(),
                delta = now - then;
    
            if (delta > interval) {
                then = now - (delta % interval);
                fn(time)
            }
        }(0))
    }

    /**
     * Surl
     *
     * surl.settings.loop = false; //to disable loop, when you want to use this.render.update() 
     * surl.add({ simple: componentA, list: componentB }) // add components
     * surl.mount(document) // mount to document
     * surl.init('simple') // initialize 'simple' as the base component
     *
     * component = {
     *     render: function (components) {
     *         return h('div')
     *     }
     *     ...
     * } // made up of any number of properties
     *   // a render property function is required
     *   // that should return a hyperscript object
     *   // example: {type: 'div', props: {}, ...children}
     *   // you can access components in the render function
     *   // from the first argument passed to the function i.e
     *   //
     *   // function (components) {
     *   //     return h('main', null, 
     *                     components.list
     *                     h('h1', null, 'Another child')
     *                 )
     *   // }
     *   // will set the list component as a child of h('main') before h('h1')
     *   //
     *   // you can also use this.render.update() to manualy trigger a render loop
     *   // if you set the surl.settings.loop to false, by default it is true
     *   // which enables the render loop... so manually you'd do something like
     *   // 
     *   // function () {
     *   //     this.data = false
     *   //     this.render.update() 
     *   //     // triggers a render loop that updates the dom if it has changed
     *   //     // which is this case it has since we updated the this.data value to false
     *   //     // assuming it was at true to begin with.
     *   // }
     *
     * 
     */
    window.surl = (function () {
        function surl (parent) {
            var self = this;

            if (parent) {
                self.parent = self.$(parent);
            }

            self.settings   = { loop: true },
            self.router     = {
                routes: {},
                raf: {id: 0},
                nav: function (url) {
                    history.pushState(null, null, url)
                },
                back: function () {
                    history.back()
                },
                foward: function () {
                    history.foward()
                },
                go: function (index) {
                    history.go(index)
                },
                listen: function () {
                    var self      = this,
                        loc       = window.location;
                        self.url  = self.url | loc.pathname;

                    raf(function () {
                        var url  = loc.href.replace(loc.protocol+'//'+loc.hostname, '');

                        if (self.url !== url) {
                            self.url = url;
                            self.changed()
                        }
                    }, 60, self.raf)
                },
                on: function (url, callback, element) {
                    if (this.interval === void 0) {
                        this.url = window.location.pathname;
                        this.listen()
                    }

                    this.routes[url] = {
                        element: element,
                        callback: callback
                    }
                },
                changed: function () {
                    var _self = this;

                    // we start of a route that looks like
                    // routes = {
                    //      '/:user/:id': fn
                    // }
                    each(_self.routes, function (value, name) {
                        var callback = value.callback,
                            element  = value.element;

                        // lets not waste anyones time
                        if (!callback || callback[_c] !== Function && callback[_c] !== Object) {
                            throw 'please use a component or function'
                        }

                        var pattern   = name,
                            url       = _self.url,
                            variables = [],
                            regex     = /([:*])(\w+)|([\*])/g,
                            match;

                        // given the following
                        // /:user/:id/*
                        // /simple/1234/what
                        pattern = pattern.replace(regex, function () {
                                        var args = arguments,
                                            id   = args[2];
                                            // 'user', 'id', undefned

                                        // if undefined 
                                        if (!id) {
                                            return '(?:.*)'
                                        }
                                        // capture
                                        else {
                                            variables.push(id);
                                            return '([^\/]+)'
                                        }
                                    });

                        // exec pattern on url
                        match   = url.match(new RegExp(pattern));

                        // we have a match
                        if (match) {
                            // create params object to pass to callback
                            // i.e {user: "simple", id: "1234"}
                            var args = match
                                // remove the first(url) value in the array
                                .slice(1, match.length)
                                .reduce(function (args, val, i) {
                                    if (!args) {
                                        args = {}
                                    }
                                    // var name: value
                                    // i.e user: 'simple'
                                    args[variables[i]] = val;
                                    return args
                                }, null);

                            // callback is a function, exec with args
                            if (callback[_c] === Function) {
                                callback(args)
                            }
                            // callback is a component, mount
                            else if (!!callback.render) {
                                self.mount(callback, element, args)
                            }
                            // can't process
                            else {
                                throw 'could not find the render method'
                            }
                        }
                    }.bind(this))
                }
            }
        }

        surl.prototype = {
            /**
             * Virtual Dom
             * @param  {Element}  a - parent element
             * @param  {Function} b - render function
             * @return {Object}     - vdom object
             */
            __vdom: function () {
                // events
                function isEventProp (name) {
                    // checks if the first two characters are on
                    return name.substring(0,2) === 'on'
                }
            
                function extractEventName (name) {
                    // removes the first two characters and converts to lowercase
                    return name.substring(2, name.length).toLowerCase()
                }
            
                function addEventListeners (target, props) {
                    for (var name in props) {
                        if (isEventProp(name)) {
                            // callback
                            var callback = props[name];
            
                            if (callback) {
                                target.addEventListener(extractEventName(name), callback, false)
                            }
                        }
                    }
                }
            
                // assign/update/remove props
                function prop (target, name, value, op) {
                    if (isEventProp(name)) {
                        return
                    }
            
                    // remove / add attribute reference
                    var attr = (op === -1 ? 'remove' : 'set') + 'Attribute';
            
                    // if the target has an attr as a property, 
                    // change that aswell
                    if (
                        target[name] !== void 0 && 
                        target.namespaceURI !== _namespace['svg']
                    ) {
                        target[name] = value
                    }

                    // set xlink:href attr
                    if (name === 'xlink:href') {
                        return target.setAttributeNS(_namespace['xlink'], 'href', value)
                    }
            
                    // don't set namespace attrs
                    // keep the presented dom clean
                    if (
                        value !== _namespace['svg'] && 
                        value !== _namespace['math']
                    ) {
                        return op === -1 ? target[attr](name) : target[attr](name, value)
                    }
                }
            
                function updateElementProp (target, name, newVal, oldVal) {
                    if (!newVal) {
                        // -1 : remove prop
                        prop(target, name, oldVal, -1)
                    } else if (!oldVal || newVal !== oldVal) {
                        // + 1 : add/update prop
                        prop(target, name, newVal, +1)
                    }
                }
            
                function updateElementProps (target, newProps, oldProps) {
                    oldProps  = oldProps !== void 0 ? oldProps : {};

                    // merge old and new props
                    var props = {};
                    for (var name in newProps) { props[name] = newProps[name] }
                    for (var name in oldProps) { props[name] = oldProps[name] }
            
                    // compare if props have been added/delete/updated
                    // if name not in newProp[name] : deleted
                    // if name not in oldProp[name] : added
                    // if name in oldProp !== name in newProp : updated
                    for (var name in props) {
                        updateElementProp(target, name, newProps[name], oldProps[name])
                    }
                }
            
                function setElementProps (target, props) {
                    for (var name in props) {
                        // initial creation, no checks, just set
                        prop(target, name, props[name], +1)
                    }
                }
            
                // create element
                function createElement (node) {
                    // handle text nodes
                    if (node[_c] === String) {
                        return document.createTextNode(node)
                    }

                    var el;

                    if (!node.render) {
                        // not a text node 
                        // check if is namespaced
                        if (node.props && node.props.xmlns) {
                            el = document.createElementNS(node.props.xmlns, node.type)
                        } else {
                            el = document.createElement(node.type)
                        }
                        
                        // diff and update/add/remove props
                        setElementProps(el, node.props);
                        // add events if any
                        addEventListeners(el, node.props);
                        
                        // only map children arrays
                        if (node.children && node.children[_c] === Array) {
                            each(node.children.map(createElement), el.appendChild.bind(el))
                        }
                    }
                    else {
                        el = node.render.parent
                    }
            
                    return el
                }
            
            
                // diffing (simple)
                function changed (node1, node2) {
                    // diff object type
                    var isType  = node1[_c] !== node2[_c],
                        // diff content
                        isDiff  = node1[_c] === String && node1 !== node2,
                        // diff dom type
                        hasType = node1.type !== node2.type;
            
                    return isType || isDiff || hasType
                }
                
                // validate
                function validate (a) {
                    // converts 0 | false to strings
                    if (a !== void 0 && (a === null || a === 0 || a === false)) {
                        a = a + ''
                    }
            
                    return a
                }
            
                // update
                function update (parent, newNode, oldNode, index) {
                    index = index ? index : 0;
            
                    oldNode = validate(oldNode);
                    newNode = validate(newNode);
            
                    // adding to the dom
                    if (!oldNode) {
                        parent.appendChild(createElement(newNode))
                    } 
                    // removing from the dom
                    else if (!newNode) {
                        parent.removeChild(parent.childNodes[index])
                    }
                    // replacing a node
                    else if (changed(newNode, oldNode)) {
                        parent.replaceChild(createElement(newNode), parent.childNodes[index])
                    }
                    // the lookup loop
                    else if (newNode.type) {
                        updateElementProps(parent.childNodes[index], newNode.props, oldNode.props);
            
                        var newLength = newNode.children.length,
                            oldLength = oldNode.children.length;
            
                        for (var i = 0; i < newLength || i < oldLength; i++) {
                            update(parent.childNodes[index], newNode.children[i], oldNode.children[i], i)
                        }
                    }
                }
                
                // get and assign arguments
                var args   = arguments,
                    parent = args[0],
                    render = args[1];

                // vdom public interface
                function vdom () {
                    // root reference
                    this.parent = parent,
                    // local copy of dynamic hyperscript reference
                    this.fn = render,
                    // raf
                    this.raf = null;
                }
                // refresh/update dom
                vdom.prototype.update = function () {
                    // get latest change
                    var newNode = this.fn(),
                        // get old copy
                        oldNode = this.old;

                    update(this.parent, newNode, oldNode);
            
                    // update old node
                    this.old = newNode
                }
                // init mount to dom
                vdom.prototype.init = function () {
                    // local copy of static hyperscript refence
                    this.old = this.fn();
                    // initial mount
                    update(this.parent, this.old)
                }
                // activate requestAnimationframe loop
                vdom.prototype.auto = function (start) {
                    var self = this;

                    // start
                    if (start) {
                        self.raf = {
                            id:1
                        };

                        // requestAnimationFrame at 60 fps
                        raf(function () {
                            self.update()
                        }, 60, self.raf)
                    }
                    // stop
                    else {
                        // push to the end of the callstack
                        // lets the current update trigger
                        // before stopping
                        setTimeout(function () {
                            cancelAnimationFrame(self.raf.id)
                        }, 0);

                        return self.raf.id
                    }
                }
            
                return new vdom
            },

            $: function (element) {
                // can't use document, use body instead
                if (element === document) {
                    element = element.body
                }
                // query selector if string
                else if (element[_c] === String) {
                    element = document.querySelector(element)
                }

                return element && element.nodeType ? element : void 0;
            },

            /**
             * initialize 
             * @param {String} id - base component to mount to dom
             */
            mount: function (cmp, element, args) {
                var self = this;

                // add parent now
                if (element) {
                    self.parent = element
                }

                // has parent to mount to
                if (self.parent) {
                    // clear dom
                    self.parent.innerHTML = '';
                    // add to dom
                    self.parent.appendChild(cmp.render.parent)

                    // exec __constructor
                    if (cmp.__constructor) {
                        cmp.__constructor(args);
                    }
                }
                // can't find parent to mount to
                else {
                    throw 'The element to mount to does not exist'
                }
            },

            /**
             * create a component
             * @param  {Object} component - component object
             * @return {Object}           - component
             */
            component: function (cmp) {
                // bind the component scope to all functions that are not 'render'
                each(cmp, function(a, b, c) {
                    if (b !== 'render' && a[_c] === Function) {
                        c[b] = a.bind(cmp)
                    }
                })

                // define parent element
                var parent = document.createElement('div');
                
                // add class namespace
                if (cmp.namespace) {
                    parent.classList.add(cmp.namespace)
                }

                // initialize render
                if (cmp.render[_c] === Function) {
                    // assign parent
                    cmp.render = {
                        fn:     cmp.render,
                        parent: parent
                    };

                    // create and bind render
                    cmp.render.fn = cmp.render.fn.bind(cmp, this.components),
                    cmp.render    = this.__vdom(cmp.render.parent, cmp.render.fn);

                    cmp.render.init();

                    // activate loop, if settings.loop = true
                    if (!!this.settings.loop) {
                        cmp.render.auto(true)
                    }
                }

                return cmp
            }
        }

        return surl
    }());


    /* --------------------------------------------------------------
     * 
     * Helpers
     *
     * can be replaced/removed if you don't need them
     * 
     * -------------------------------------------------------------- */


    // hyperscript helper
    window.h = (function () {
        /**
         * hyperscript tagger
         * @param  {Object} a - object with opt props key
         * @param  {Object} b - tag
         * @return {[Object]} - {props, type}
         * @example
         * // return {type: 'input', props: {id: 'id', type: 'checkbox'}}
         * tag('inpu#id[type=checkbox]')
         */
        function tag (obj) {
            var classes = [], 
                match,
                parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g,

                // copy obj's props to abstract props and type
                // incase obj.props is empty create new obj
                // otherwise just add to already available object
                // we will add this back to obj.props later
                props = !obj.props ? {} : obj.props,

                // since we use type in a while loop
                // we will be updating obj.type directly
                type = obj.type;

                // set default type to a div
                obj.type = 'div';

            // execute the regex and loop through the results
            while ((match = parser.exec(type))) {
                // no custom prop match
                if (match[1] === '' && match[2]) {
                    obj.type = match[2]
                }
                // matches id's - #id
                else if (match[1] === '#') {
                    props.id = match[2]
                } 
                // matches classes - div.classname
                else if (match[1] === '.') {
                    classes.push(match[2])
                } 
                // matches - [attr=value]
                else if (match[3][0] === '[') {
                    var attr = match[6];

                    // make sure we have a non null|undefined|false value
                    if (attr) {
                        // remove the '[]'
                        attr = attr.replace(/\\(["'])/g, '$1')
                    }
                    // if attr value is an empty string assign true
                    props[match[4]] = attr | true
                }
            }

            // add classes to obj.props if we have any
            if (classes.length > 0) {
                props.class = classes.join(' ')
            }

            // as promised, update props
            obj.props = props;
            
            // done
            return obj
        }

        /**
         * convert anything not an array, string or objects to a string
         * @param  {Any} a
         * @return {String|Array|Object}
         */
        function set (a, obj) {
            // add obj.prop to children if they are none TextNodes
            if (a && a[_c] === Object && obj.props.xmlns) {
                a.props.xmlns = obj.props.xmlns
            }

            a = a !== void 0 && a !== null && (a[_c] === Object || a[_c] === String || a[_c] === Array) ? 
                a : 
                a + '';
            // convert the null, and undefined strings to empty strings
            // we don't convert false since that could 
            // be a valid value returned to the client
            a = a === 'null' || a === 'undefined' ? '' : a;
            return a
        }

        /**
         * create virtual element : h()
         * @param  {String} type  - Element, i.e: div
         * @param  {Object} props - optional properties
         * @return {Object}       - {type, props, children}
         * @example
         * h('div', {class: 'close'}, 'Text Content')
         * h('div', null, h('h1', 'Text'));
         */
        function hyperscript (type, props) {
            var len = arguments.length,
                key = 2,
                child,
                obj = {type: type, props: props, children: []};

            // insure props is always an object
            if (obj.props === null || obj.props === void 0 || obj.props[_c] !== Object) {
                obj.props = {}
            }

            // check if the type is a special case i.e [type] | div.class | #id
            // and alter the hyperscript
            if (
                obj.type.indexOf('[') !== -1 || 
                obj.type.indexOf('#') !== -1 || 
                obj.type.indexOf('.') !== -1
            ) {
                obj = tag(obj)
            }

            // auto set namespace for svg and math elements
            // we will then check when setting it's children
            // if the parent has a namespace we will set that
            // to the children as well, if you set the
            // xmlns prop we default to that instead of the 
            // svg and math presets
            if (obj.type === 'svg' || obj.type === 'math') {
                // only add the namespace if it's not already set
                if (!obj.props.xmlns) {
                    obj.props.xmlns = _namespace[obj.type]
                }
            }

            // construct children
            for (var i = key; i < len; i++) {
                // reference to current layer
                child = arguments[i];
        
                // if the child is an array go deeper
                // and set the 'arrays children' as children
                if (child && child[_c] === Array) {
                    for (var k = 0; k < child.length; k++) {
                        obj.children[(i-key) + k] = set(child[k], obj)
                    }
                }
                // deep enough, add this child to children
                else {
                    obj.children[i - key] = set(child, obj)
                }
            }

            return obj
        }

        return hyperscript
    }());

    // animate helper
    window.animate = (function () {
        /**
         * animate component/element
         * 
         * - adds `animating` class to document.body and element passed
         * while animating, removes them when the animation is done.
         *
         * @param  {Element} element   
         * @param  {Array}   transforms 'describe additional transforms'
         * @param  {Number}  duration   'duration of the animation'
         * @param  {String}  className  'class that represents end state animating to'
         * 
         * @return {Void}
         *
         * @example
         * h('.card', {onclick: animate}, h('p', null, a))
         * // or 
         * h('.card', {onclick: animate.bind(400, 'endClassName', '0,0,0,1.2')}, h('p', null, a))
         * // or 
         * animate(target, 'endClassName', 400, ['rotate(25deg)', 'translate(-20px)'])
         */
        function animate() {
            // declare variables
            var args, className, duration, transform, easing, element,
                first, last, invert, animation, webAnimations,
                first = last = invert = animation = {},
                // assign arguments
                args = Array.prototype.slice.call(arguments);

            for (var i = args.length - 1; i >= 0; i--) {
                var arg = args[i];

                if (arg[_c] === Array) {
                    transform = arg.join(' ')
                } else if (arg[_c] === Number) {
                    duration = arg
                } else if (arg[_c] === String) {
                    if (arg.indexOf(',') !== -1) { easing = arg }
                    else { className = arg }
                } else if (!!arg.target) {
                    element = arg.target
                }
            }

            if (this[_c] === Number) {
                duration = this
            } else if (this[_c] === String) {
                className = this
            } else if (!className) {
                className = 'animation-active';
            }

            // we need an end state class and element to run
            if (!className || !element) {
                return
            }

            // promote element to individual composite layer
            element.style.willChange = 'transform';
            // get first state
            first = element.getBoundingClientRect();
            // assign last state
            element.classList.toggle(className);
            // get last state
            last = element.getBoundingClientRect();
            // get invert values
            invert.x = first.left - last.left;
            invert.y = first.top - last.top;
            invert.sx = first.width / last.width;
            invert.sy = first.height / last.height;

            // animation type
            // if this is set we opt for the more performant
            // web animations api
            if (element.animate && element.animate[_c] === Function) {
                var webAnimations = true
            }

            animation.first = 'translate('+invert.x+'px,'+invert.y+'px) translateZ(0)'+' scale('+invert.sx+','+invert.sy+')',
            animation.first = transform ? animation.first + ' ' + transform : animation.first,
            animation.last = 'translate(0,0) translateZ(0) scale(1,1) rotate(0) skew(0)',
            animation.duration = duration ? duration : 200,
            animation.easing = easing ? 'cubic-bezier('+easing+')' : 'cubic-bezier(0,0,0.32,1)',
            element.style.transformOrigin = '0 0';

            // reflect animation state on dom
            element.classList.add('animation-running');
            document.body.classList.add('animation-running');
            document.body.classList.toggle('animation-active');

            // use native web animations api if present
            // presents better performance
            if (webAnimations) {
                var player = element.animate([
                  {transform: animation.first},
                  {transform: animation.last}
                ], {
                    duration: animation.duration,
                    easing: animation.easing
                });

                player.addEventListener('finish', onfinish);
            } else {
                element.style.transform = animation.first;
                // trigger repaint 
                element.offsetWidth;
                element.style.transition = 'transform '+animation.duration+'ms '+animation.easing,
                element.style.transform = animation.last;
            }

            // cleanup
            function onfinish(e) {
                if (!webAnimations) {
                    // bubbled events
                    if (e.target != element) {
                        return
                    }
                    element.style.transition = null,
                    element.style.transform = null;
                }
                element.style.transformOrigin = null,
                element.style.willChange = null;

                element.classList.remove('animation-running');
                document.body.classList.remove('animation-running');
                element.removeEventListener('transitionend', onfinish);
            }

            if (!webAnimations) {
                element.addEventListener('transitionend', onfinish);
            }
        }

        return animate
    }());
}())