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
        var raf = 'requestAnimationFrame',
            caf = 'cancelAnimationFrame',
            v   = ['webkit', 'moz'],
            vl  = v.length,
            af  = 'AnimationFrame',
            lt = 0; 
            // last time

        for (var x = 0; x < vl && !window[raf]; ++x) {
            window[raf] = window[v[x]+'Request'+af];
            window[caf] = window[v[x]+'Cancel'+af]||window[v[x]+'CancelRequest'+af]
        }

        if (!window[raf]) {
            window[raf] = function(callback) {
                var currTime = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lt)),
                    id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);

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
        }

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
    window.surl = {
        /**
         * Virtual Dom
         * @param  {Element}  a - parent element
         * @param  {Function} b - render function
         * @return {Object}     - vdom object
         */
        vdom: function () {
            // requestAnimationFrame
            function raf (fn, fps, raf) {
                var then = new Date().getTime();
            
                // custom fps, otherwise fallback to 60
                fps = fps || 60;
                var interval = 1000 / fps;
            
                return (function loop(time) {
                    raf.id = requestAnimationFrame(loop);
            
                    var now = new Date().getTime(),
                        delta = now - then;
            
                    if (delta > interval) {
                        then = now - (delta % interval);
                        fn(time)
                    }
                }(0))
            }

            // events
            function isEventProp (name) {
                return name.substring(0,2) === 'on'
            }
        
            function extractEventName (name) {
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
            vdom.prototype.init = function () {
                // local copy of static hyperscript refence
                this.old = this.fn();
                // initial mount
                update(this.parent, this.old)
            }
            vdom.prototype.loop = function (start) {
                var self = this;

                if (start === true) {
                    self.raf = {
                        id:1
                    };

                    raf(function () {
                        self.update();
                    }, 60, self.raf)
                } 
                else if (start === false) {
                    setTimeout(function () {
                        cancelAnimationFrame(self.raf.id);
                    }, 0)

                    return self.raf.id
                }
            }
        
            return new vdom
        },

        /**
         * create a component
         * @param  {Object} component - component object
         * @param  {String} id        - component id
         * @return {Object}           - component
         */
        create: function (cmp, id) {
            // bind all functions 'this' to the component scope
            // except render
            each(cmp, function(a, b, c) {
                if (b !== 'render' && a[_c] === Function) {
                    c[b] = a.bind(cmp)
                }
            })

            // define parent element
            var parent = document.createElement('div')
                parent.classList = '-'+id;

            // add parent
            cmp.render = {
                fn: cmp.render,
                parent: parent
            }

            return cmp
        },

        /**
         * initialize 
         * @param {String} id - base component to mount to dom
         */
        init: function (id) {            
            var self   = this,
                cmps   = self.cmps,
                cmp    = cmps[id],
                parent = self.parent;

            if (cmp) {
                // add to dom
                if (!!parent) {
                    parent.appendChild(cmp.render.parent)
                }
                // can't element doesn't exist
                else {
                    throw 'The element to mount to does not exist'
                }
            }

            return this
        },

        /**
         * mount component to dom
         * @param {Element} parent - element to mount to
         */
        mount: function (parent) {
            // can't append to document, use body instead
            if (parent === document) {
                parent = parent.body
            }
            // query selector if string
            else if (parent[_c] === String) {
                parent = document.querySelector(parent)
            }

            this.parent = parent;

            return this
        },

        /**
         * add components
         * @param {Object} settings - component settings
         */
        add: function (settings) {
            var self      = this;
                self.cmps = {};

            // add components
            each(settings, function(a, b) {
                self.cmps[b] = self.create(a, b)
            });

            // iterate through components and initialize within namespace
            each(self.cmps, function(a, b, c) {
                c[b].render.fn = a.render.fn.bind(a, self.cmps),
                c[b].render    = self.vdom(a.render.parent, a.render.fn);
                c[b].render.init();

                // active loop if is still true in settings
                if (self.settings && self.settings.loop === true) {
                    c[b].render.loop(true)
                }

                // process constructor method
                if (c[b].init) {
                    c[b].init()
                }
            });

            return this
        },

        settings: {
            loop: true
        }
    }


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
                    props[match[4]] = attr || true
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

    // router helper
    window.router = (function () {
        /**
         * router
         * @examples
         * router.on('/simple', 'simple') // connect 'simple' component to /simple URI
         * router.on('/page', 'page')     // connet 'page' component to /page URI
         * router.nav('/simple')          // navigate to /simple URI
         * router.back()                  // go back
         * router.foward()                // go foward
         * router.go(-1)                  // go to any history state accepts any +/- number
         */
        return {
            routes: {},
            path: null,
            listen: function () {
                var self = this,
                    loc = window.location;
                    self.path = loc.pathname;

                clearInterval(this.interval);
                this.interval = setInterval(function(){
                    var path = loc.href.replace(loc.protocol+'//'+loc.hostname, '');

                    if (self.path !== path) {
                        self.path = path;
                        self.changed(path)
                    }
                }, 50)
            },
            on: function (path, callback) {
                if (this.interval === void 0) {
                    this.listen()
                }
                this.routes[path] = callback;                   
            },
            changed: function () {
                var path   = this.path,
                    routes = this.routes,
                    route  = routes[path];

                if (!!route) {
                    var cmps = surl.cmps,
                        cmp  = cmps[route];
                        cmp  = cmp ? cmp.render : null;

                    if (cmp) {
                        surl.parent.innerHTML = '';
                        surl.parent.appendChild(cmp.parent)
                    }
                }
            },

            nav: function (path) {
                history.pushState(null, null, path)
            },
            back: function () {
                history.back()
            },
            foward: function () {
                history.foward()
            },
            go: function (index) {
                history.go(index)
            }
        }
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