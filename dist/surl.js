/**
 * Surl - Virtual Dom Library
 *
 * @author Sultan Tarimo <https://github.com/sultantarimo>
 */
(function () {
    'use strict';

    /**
     * requestAnimationFrame Polyfill
     */
    function rafPoly () {
        // references
        var raf = 'requestAnimationFrame',
            caf = 'cancelAnimationFrame',
            v   = ['ms', 'moz', 'webkit'],
            vl  = v.length,
            af  = 'AnimationFrame',
            lt  = 0,
            w   = window;
            // last time

        // normalize vendors
        for (var x = 0; x < vl && !w[raf]; ++x) {
            w[raf] = w[v[x]+'Request'+af];
            w[caf] = w[v[x]+'Cancel'+af]||w[v[x]+'CancelRequest'+af]
        }

        // raf doesn't exist, polyfill it
        if (!w[raf]) {
            w[raf] = function(callback) {
                var currTime   = new Date().getTime(),
                    timeToCall = Math.max(0, 16 - (currTime - lt)),
                    id         = w.setTimeout(function() { 
                                    callback(currTime + timeToCall)
                                 }, timeToCall);

                    lt = currTime + timeToCall;

                return id
            };
        }

        if (!w[caf]) {
            w[caf] = function(id) {
                clearTimeout(id)
            }
        }
    }

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
        fps = fps || 60;
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
     * serialize + encode object
     * @param  {Object}  a `object to serialize`
     * @return {String}   serialized object
     * @example
     * // returns 'url=http%3A%2F%2F.com'
     * param({url:'http://.com'})
     */
    function param (a) {
        var c = [];
    
        for (var d in a) {
            var v = a[d];
    
            c.push(typeof v == 'object' ? param(v, d) : 
                encodeURIComponent(d) + '=' + encodeURIComponent(v))
        }
    
        return c.join('&')
    }
    
    /**
     * ajax helper
     * @param  {Object}   settings `ajax settings object`
     * @param  {Function} callback `function to run onload`
     * @example
     * // returns xhr Object
     * ajax({url, method, data}, fn(res, err) => {})
     */
    function ajax (settings, callback) {
        var xhr      = new XMLHttpRequest(),
            location = window.location,
            url      = settings.url,
            callback = settings.callback,
            method   = settings.method,
            a        = document.createElement('a');
            a.href   = url;
    
        // is this a CROSS ORIGIN REQUEST check
        var CORS = !(
            a.hostname === location.hostname &&
            a.port === location.port &&
            a.protocol === location.protocol &&
            location.protocol !== 'file:'
        );
            a = null;
    
        xhr.open(method, url, true);
    
        xhr.onerror = function () {
            callback(this, true)
        };
    
        xhr.onload = function () {
            // callback specified
            if (callback) {
                var params, response;
    
                if (this.status >= 200 && this.status < 400) {
                    // determine return data type
                    var type    = xhr.getResponseHeader("content-type"),
                        __type;

                    if (type.indexOf(';') !== -1) {
                        __type = type.split(';');
                        __type = __type[0].split('/')
                    }
                    else {
                        __type = type.split('/')
                    }

                    type = __type[1];

                    // json
                    if (type === 'json') {
                        response = JSON.parse(xhr.responseText)
                    }
                    // html, create dom
                    else if (type === 'html') {
                        response = (new DOMParser()).parseFromString(xhr.responseText, "text/html")
                    }
                    // just text
                    else {
                        response = xhr.responseText
                    }
    
                    params = [response, false]
                } else {
                    params = [this, true]
                }
    
                callback(params[0], params[1])
            }
        }
    
        if (CORS) {
            xhr.withCredentials = true
        }
    
        if (method !== 'GET') {
            // set type of data sent : text/json
            xhr.setRequestHeader(
                'Content-Type', 
                settings.data[_c] === Object ? 'application/json' : 'text/plain'
            )
        }
    
        if (method === 'POST') {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(param(settings))
        } else {
            xhr.send()
        }
    
        return xhr
    }


    /* --------------------------------------------------------------
     * 
     * Core
     * 
     * -------------------------------------------------------------- */


    /**
     * surl
     * @param  {Element?} parent - optional parent element
     * @return {surl}
     */
    function surl (parent) {
        var self = this;

        if (parent) {
            self.parent = self.__$(parent);
        }

        self.settings   = { loop: true },

        self.router     = {
            url: null,
            nav: function (url) {
                history.pushState(null, null, url);
                window.dispatchEvent(new Event('popstate'))
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
            destroy: function () {
                this.routes = {};
                cancelAnimationFrame(this.raf.id);
            },
            listen: function () {
                var self      = this,
                    loc       = window.location;
                    self.url  = null;
                    self.raf  = {id: 0};

                // start listening for a a change in the url
                raf(function () {
                    var url = loc.pathname;

                    if (self.url !== url) {
                        self.url = url;
                        self.changed()
                    }
                }, 60, self.raf)
            },
            on: function (url) {
                var self = this,
                    routes;

                // create routes object if it doesn't exist
                if (!self.routes) {
                    self.routes = {}
                }

                // start listening for route changes
                if (!self.raf) {
                    self.listen()
                }

                // normalize args for ({obj}) and (url, callback) styles
                if (url[_c] !== Object) {
                    var args   = arguments;
                        routes = {};
                        routes[args[0]] = args[1];
                }
                else {
                    routes = url;
                }

                // assign routes
                each(routes, function (value, name) {
                    var variables = [],
                        regex     = /([:*])(\w+)|([\*])/g,
                        // given the following /:user/:id/*
                        pattern = name.replace(regex, function () {
                                    var args = arguments,
                                        id   = args[2];
                                        // 'user', 'id', undefned

                                    // if not a variable 
                                    if (!id) {
                                        return '(?:.*)'
                                    }
                                    // capture
                                    else {
                                        variables.push(id);
                                        return '([^\/]+)'
                                    }
                                });

                    self.routes[name] = {
                        callback:  value,
                        pattern:   pattern,
                        variables: variables
                    }
                })
            },
            changed: function () {
                var _self = this;

                each(_self.routes, function (val) {
                    var callback  = val.callback,
                        pattern   = val.pattern,
                        variables = val.variables,
                        url       = _self.url,
                        match;

                    // exec pattern on url
                    match = url.match(new RegExp(pattern));

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

                        // callback is a function, exec
                        if (callback && callback[_c] === Function) {
                            // component function
                            if (callback.cmp) {
                                self.mount(callback, void 0, args)
                            }
                            // normal function
                            else {
                                callback(args)
                            }
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
            
                // set xlink:href attr
                if (name === 'xlink:href') {
                    return target.setAttributeNS(_namespace['xlink'], 'href', value)
                }

                // if the target has an attr as a property, 
                // change that aswell
                if (
                    target[name] !== void 0 && 
                    target.namespaceURI !== _namespace['svg']
                ) {
                    target[name] = value
                }
                // don't set namespace attrs and properties that
                // can be set via target[name]
                else if (
                    value !== _namespace['svg'] && 
                    value !== _namespace['math']
                ) {
                    return op === -1 ? target[attr](name) : target[attr](name, value)
                }
            }
        
            function updateElementProp (target, name, newVal, oldVal) {
                if (newVal === void 0 || newVal === null) {
                    // -1 : remove prop
                    prop(target, name, oldVal, -1)
                } 
                else if (oldVal === void 0 || oldVal === null || newVal !== oldVal) {
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

                // not a text node 
                // check if is namespaced
                if (node.props && node.props.xmlns) {
                    el = document.createElementNS(node.props.xmlns, node.type)
                } 
                else {
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
        
                return el
            }
        
        
            // diffing a node
            function changed (node1, node2) {
                // diff object type
                var isDiffType  = node1[_c] !== node2[_c],
                    // diff text content
                    isDiffText  = node1[_c] === String && node1 !== node2,
                    // diff dom type
                    isDiffDom   = node1.type !== node2.type;
        
                return isDiffType || isDiffText || isDiffDom
            }
            
            // validate
            function validate (a) {
                // converts 0 | false to strings
                if (a !== void 0 && (a === null || a === 0 || a === false)) {
                    a = a + ''
                }
        
                return a
            }
        
            // diff
            function diff (parent, newNode, oldNode, index) {
                index = index ? index : 0;
        
                oldNode = validate(oldNode);
                newNode = validate(newNode);
        
                // adding to the dom
                if (oldNode === void 0) {
                    parent.appendChild(createElement(newNode))
                } 
                // removing from the dom
                else if (newNode === void 0) {
                    var node = parent.childNodes[index];

                    // send to the end of the event queue
                    setTimeout(function () {
                        parent.removeChild(node)
                    }, 0)
                }
                // replacing a node
                else if (changed(newNode, oldNode)) {
                    parent.replaceChild(createElement(newNode), parent.childNodes[index])
                }
                // the lookup loop
                else if (newNode.type) {
                    // diff, update props
                    updateElementProps(parent.childNodes[index], newNode.props, oldNode.props);
                    
                    // loop through all children
                    var newLength = newNode.children.length,
                        oldLength = oldNode.children.length;
            
                    
                    for (var i = 0; i < newLength || i < oldLength; i++) {
                        diff(parent.childNodes[index], newNode.children[i], oldNode.children[i], i)
                    }
                }
            }

            // vdom public interface
            function vdom (parent, render) {
                // root reference
                this.parent = parent,
                // local copy of dynamic hyperscript reference
                this.render = render,
                // raf
                this.raf = null;
            }
            // refresh/update dom
            vdom.prototype.update = function () {
                // get latest change
                var newNode = this.render(),
                    // get old copy
                    oldNode = this.old;

                diff(this.parent, newNode, oldNode);
        
                // update old node
                this.old = newNode
            }
            // init mount to dom
            vdom.prototype.init = function () {
                // local copy of static hyperscript refence
                this.old = this.render();
                // initial mount
                diff(this.parent, this.old)
            }
            vdom.prototype.destroy = function () {
                this.auto(false);

                this.old    = void 0,
                this.render = void 0,
                this.raf    = void 0,
                this.parent = void 0;
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
                    cancelAnimationFrame(self.raf.id)

                    return self.raf.id
                }
            }
        
            return vdom
        },

        /**
         * get element
         * @param  {Selector|Element} element - an element or string
         * @return {Element|Void}
         */
        __$: function (element) {
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
         * make ajax requests
         * @return {Object} xhr object
         */
        req: function () {
            var args     = arguments,
                settings = {};

            each(args, function (val) {
                if (val[_c] === Object) {
                    settings.data = val
                }
                else if (val[_c] === Function) {
                    settings.callback = val
                }
                else if (val[_c] === String) {
                    var type = val.toUpperCase();

                    if (type === 'POST' || type === 'GET') {
                        settings.method = type
                    } 
                    else {
                        settings.url = val
                    }  
                }
            });
            
            // process
            ajax(settings)
        },

        /**
         * initialize 
         * @param {String} id - base component to mount to dom
         */
        mount: function (cmp, el, params) {
            var self = this,
                params;

            // add parent element
            if (el) {
                if (el[_c] === String) {
                    self.parent = document.querySelector(el)
                }
                else if (el.nodeType) {
                    self.parent = el
                }
            }

            // has parent to mount to
            if (self.parent) {
                // clear dom
                self.parent.innerHTML = '';
                
                // destroy the current vdom if it already exists
                if (self.vdom) {
                    self.vdom.destroy()
                }

                if (cmp.__constructor) {
                    cmp.__constructor(params)
                }

                // activate vdom
                self.vdom = this.__vdom(),
                self.vdom = new self.vdom(self.parent, cmp);

                self.vdom.init();

                // activate loop, if settings.loop = true
                if (!!this.settings.loop) {
                    self.vdom.auto(true)
                }
            }
            // can't find parent to mount to
            else {
                throw 'the element to mount to does not exist'
            }
        },

        /**
         * create a component
         * @param  {Object} component - component object
         * @return {Object}           - component
         */
        component: function (opts) {
            // add props, state namespace
            opts.props = opts.props || {}
            opts.state = opts.state || {}

            // create component
            var cmpClass = function () {
                var self = this;
                // add props to component
                each(opts, function (value, name) {
                    // bind the component scope to all methods
                    if (value[_c] === Function) {
                        value = value.bind(self)
                    }

                    self[name] = value
                })
            }

            each(['Props', 'State'], function (method) {
                var methodRef = method.toLowerCase();

                cmpClass.prototype['set'+method] = function (obj) {
                    var self = this;

                    each(obj, function (value, name) {
                        self[methodRef][name] = value
                    })
                }
            });

            // create component object
            var cmpObj = new cmpClass;

            // create component returned value
            var cmpFn = function (props) {
                if (props) {
                    cmpObj.setProps(props)
                }

                return cmpObj.render()
            }

            // attach constructor
            if (cmpObj.__constructor) {
                cmpFn.__constructor = cmpObj.__constructor
            }

            // differentiate between other functions and this
            cmpFn.cmp = true;

            return cmpFn
        },

        createClass: function (opts) {
            return this.component(opts)
        }
    }


    /* --------------------------------------------------------------
     * 
     * Helpers
     *
     * can be replaced/removed, if not needed
     * 
     * -------------------------------------------------------------- */


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
    function set (child, obj) {
        // add obj.prop to children if they are none TextNodes
        if (child && child[_c] === Object && obj.props.xmlns) {
            child.props.xmlns = obj.props.xmlns
        }

        child = child !== void 0 && child !== null && (child[_c] === Object || child[_c] === String || child[_c] === Array) ? 
            child : 
            child + '';
        // convert the null, and undefined strings to empty strings
        // we don't convert false since that could 
        // be a valid value returned to the client
        child = child === 'null' || child === 'undefined' ? '' : child;
        return child
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
        var args = arguments,
            len = args.length,
            key = 2,
            child;

        // no props specified default 2nd arg to children
        if (
            props && 
            (props.hs || props[_c] === String || props[_c] === Array)
        ) {
            key = 1,
            props = {}
        }
        // insure props is always an object
        else if (props === null || props === void 0 || props[_c] !== Object) {
            props = {}
        }

        // declare hyperscript object
        var obj = {type: type, props: props, children: [], hs: true};

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
            child = args[i];
    
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
            } 
            else if (arg[_c] === Number) {
                duration = arg
            } 
            else if (arg[_c] === String) {
                if (arg.indexOf(',') !== -1) { 
                    easing = arg 
                }
                else { 
                    className = arg 
                }
            } 
            else if (!!arg.target) {
                element = arg.target
            }
        }

        if (this[_c] === Number) {
            duration = this
        } 
        else if (this[_c] === String) {
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


    rafPoly();
    
    window.h       = hyperscript,
    window.animate = animate,
    window.surl    = surl;
}());