/**
 * requestAnimationFrame Polyfill
 */
(function() {
    var raf = 'requestAnimationFrame',
        caf = 'cancelAnimationFrame',
        lastTime = 0,
        v = ['webkit', 'moz'],
        vLen = v.length;

    for (var x = 0; x < vLen && !window[raf]; ++x) {
        window[raf] = window[v[x]+'RequestAnimationFrame'];
        window[caf] = window[v[x]+'CancelAnimationFrame']||window[v[x]+'CancelRequestAnimationFrame']
    }

    if (!window[raf]) {
        window[raf] = function(callback) {
            var currTime = new Date().getTime(),
                timeToCall = Math.max(0, 16 - (currTime - lastTime)),
                id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);

                lastTime = currTime + timeToCall;

            return id
        };
    }

    if (!window[caf]) {
        window[caf] = function(id) {
            clearTimeout(id)
        }
    }
}());


/* -------------------------------------------------------------- */


/**
 * create virtual element : h()
 *
 * @global
 * @param  {String} type  `Element, i.e: div`
 * @param  {Object} props `optional properties`
 * @return {Object}       '{type, props, children}'
 *
 * @example
 * h('div', {class: 'close'}, 'Text Content')
 * h('div', null, h('h1', 'Text'));
 */
function h(type, props) {
    var len = arguments.length,
        key = 2,
        children = [],
        child,
        _c = 'constructor';

    for (var i = key; i < len; i++) {
        child = arguments[i];

        if (child && child[_c] === Array) {
            for (var k = 0; k < child.length; k++) {
                children[ (i-key) + k ] = child[k]
            }
        } else {
            children[i - key] = child
        }
    }

    if (props === null || props[_c] !== Object) {
        props = {}
    }

    return {
        type: type,
        props: props,
        children: children
    }
}


/**
 * create property/dynamic state p()
 *
 * The backbone is the cheap diffing we can do
 * 
 * @param  {Any} a `set value`
 * @return {Any}   `value set`
 *
 * @example
 * var a = p(new Date());
 * a() // date object
 * a.toJSON() // string object
 */
function p(a) {
    return function (b) {
        function prop() {
            if (arguments.length) b = arguments[0];
            return b
        }
        prop.toJSON = function () {
            return JSON.stringify(b)
        }
        return prop
    }(a)
}


/* -------------------------------------------------------------- */


/**
 * create component : c()
 *
 * @global
 * @param  {Object} options `descriping component`
 * @return {Object}         `instance of created component`
 *
 * @example
 * c({
 *     element:     function(state, evt) { h('div', {onClick: evt.method}, state.default) },  
 *     state:       {
 *         default: 0
 *     }
 *     behavior:    fn() => {
 *         this.constructor = fn;
 *         this.method = fn;
 *     }
 * })
 * c.init();
 */
function c(opts) {
    'use strict';


    // common method references
    var _p = 'prototype',
        _c = 'constructor';


    /**
     * serialize + encode object
     *
     * @private
     * @param  {Object}  a `object to serialize`
     * @return {String}   serialized object
     *
     * @example
     * // returns 'url=http%3A%2F%2F.com'
     * param({url:'http://.com'})
     */
    function param(a) {
        var c = [];

        for (var d in a) {
            var v = a[d];

            c.push(typeof val == 'object' ? param(v, d) : 
                encodeURIComponent(d) + '=' + encodeURIComponent(v))
        }

        return c.join('&')
    }

    /**
     * ajax helper
     *
     * @private
     * @param  {Object}   settings `ajax settings object`
     * @param  {Function} callback `function to run onload`
     * @return {Void 0}
     *
     * @example
     * // returns xhr Object
     * ajax({url, method, data}, fn(res, err) => {})
     */
    function ajax(settings, callback) {
        var xhr = new XMLHttpRequest(),
            location = window.location,
            a = document.createElement('a');
            a.href = settings.url;

        // is this a CROSS ORIGIN REQUEST check
        var CORS = !(
            a.hostname === location.hostname &&
            a.port === location.port &&
            a.protocol === location.protocol &&
            location.protocol !== 'file:'
        );

        xhr.open(settings.method, settings.url, true);

        xhr.onerror = function() {
            callback(this, true)
        };

        xhr.onload = function(res, response) {
            // no callback specified
            if (!callback) return;

            if (this.status >= 200 && this.status < 400) {
                // determine return data type
                var type = xhr.getResponseHeader("content-type"),
                    type = type.split(';'),
                    type = type[0].split('/'),
                    type = type[type.length-1];

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

                res = [response, false]
            } else {
                res = [this, true]
            }

            callback(res[0], res[1])
        };


        if (CORS) {
            xhr.withCredentials = true
        }

        if (settings.method !== 'GET') {
            // set type of data sent : text/json
            xhr.setRequestHeader(
                'Content-Type', 
                settings.data[_c] === Object ? 'application/json' : 'text/plain'
            )
        }

        if (settings.method === 'POST') {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(param(settings))
        } else {
            xhr.send()
        }

        return xhr
    }

    /**
     * merge 2 objects
     * 
     * @param  {Object} a `empty object to add merged properties to`
     * @param  {Object} b `first object`
     * @param  {Object} c `second object`
     * @return {Object}   `new merged object`
     *
     * @example
     * // returns {a: 2, b: 2, c: 5}
     * merge({}, {a: 1, b: 2}, {a: 2, c: 5})
     */
    function merge(a, b, c) {
        for (var attrname in b) { a[attrname] = b[attrname] }
        for (var attrname in c) { a[attrname] = c[attrname] }
        return c
    }

    /**
     * requestAnimation loop
     * @param  {Function} fn  `loop`
     * @param  {fps}      fps `frames per second`
     * @return {Object}       `raf object`
     */
    function fps(fn, fps, raf) {
        var then = new Date().getTime();

        // custom fps, otherwise fallback to 60
        fps = fps || 60;
        var interval = 1000 / fps;
     
        return (function loop(time) {
            raf.id = requestAnimationFrame(loop),
            raf.active = true;

            var now = new Date().getTime(),
                delta = now - then;
     
            if (delta > interval) {
                then = now - (delta % interval);
                fn(time)
            }
        }(0));
    };

    /**
     * template parser
     * 
     * @public
     * @param  {String} a `string to parse`
     * @return {Object}   `{data: (data) => {}}`
     *
     * * @example
     * // returns 'Hello World'
     * tmpl('Hello, {person}').data({person: 'World'})
     */
    function tmpl(a) {
        return {
            data: function(b) {
                for (var item in b) {
                    a = a.replace( 
                        new RegExp('{'+item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +'}', 'g'),
                        esc(b[item]) 
                    )
                }

                return a
            }
        }
    }

    /**
     * escape string
     * 
     * @public
     * @param  {String} a `string to escape`
     * @return {String}   `escaped string`
     */
    function esc(a) {
        return (a+'').replace(/[&<>"'\/]/g, function(i) {
            var obj = {
                '&':'&amp;',
                '<':'&lt;',
                '>': '&gt;',
                '"':'&quot;',
                "'":'&#39;',
                '/':'&#x2F;'
            };

            return obj[i]
        })
    }

    /**
     * object iterate + update
     * 
     * @param  {Object}   obj       `object to change`
     * @param  {Function} result    `what to change`
     * @return {Object}             `changed object`
     */
    function iterate(obj, result) {
        for (var key in obj) {

            if (result) {
                var r = result(key, obj);

                if (r) {
                    obj[key] = r
                }
            }

            // Recurse into children
            if (obj[key] !== null && typeof obj[key] === 'object') {
                iterate(obj[key], result)
            }
        }

        return obj
    }

    /**
     * forEach helper
     * 
     * @param  {Array|Object} a 
     * @param  {Function}     b
     * @return {Array|Object}  
     */
    function each(a, b) {
        var i;

        // Handle arrays
        if (typeof a.length == 'number') {
            var i = 0, 
                l = a.length;

            for (; i < l; ++i) { 
                if ( b.call(a[i], a[i], i, a) === false ) {
                    return a
                }
            }
        }
        // Handle objects 
        else {
            for (i in a) {
                if ( b.call(a[i], a[i], i, a) === false ) {
                    return a
                }
            }
        }

        return a
    }


    /* -------------------------------------------------------------- */


    function vdom(a, b, c, d) {
        // events
        function isEventProp(name) {
            return name.substring(0,2) === 'on'
        }

        function extractEventName(name) {
            return name.substring(2, name.length).toLowerCase()
        }

        function addEventListeners(target, props) {
            for (var name in props) {
                if (isEventProp(name)) {
                    // callback
                    var cb = props[name];

                    // not directly references, 
                    // check if string value is a defined behavior
                    if (cb[_c] !== Function) {
                        cb = !!c.behavior[cb] ? c.behavior[cb] : null
                    }

                    if (cb) {
                        target.addEventListener(extractEventName(name), cb, false)
                    }
                }
            }
        }

        // assign/update/remove props
        function prop(target, name, value, op) {
            if (isEventProp(name)) {
                return
            }

            // remove / add attribute reference
            var attr = (op === -1 ? 'remove' : 'set') + 'Attribute';

            // if the target has a attr as a property, change that aswell
            if (target[name] !== void 0) {
                target[name] = value
            }

            return op === -1 ? target[attr](name) : target[attr](name, value);
        }

        function updateElementProp(target, name, newVal, oldVal) {
            if (!newVal) {
                // -1 : remove prop
                prop(target, name, oldVal, -1)
            } else if (!oldVal || newVal !== oldVal) {
                // + 1 : add/update prop
                prop(target, name, newVal, +1)
            }
        }

        function updateElementProps(target, newProps, oldProps) {
            oldProps  = oldProps !== void 0 ? oldProps : {};

            // copy old+new props into single object
            var props = merge({}, newProps, oldProps);

            // compare if props have been added/delete/updated
            // if name not in newProp[name] : deleted
            // if name not in oldProp[name] : added
            // if name in oldProp !== name in newProp : updated
            for (var name in props) {
                updateElementProp(target, name, newProps[name], oldProps[name])
            }
        }

        function setElementProps(target, props) {
            for (var name in props) {
                // initial creation, no checks, just set
                prop(target, name, props[name], +1)
            }
        }


        // create element
        function createElement(node) {
            // convert undefined to empty string
            if (node === void 0 || node === null) {
                node = ''
            }
            // convert numbers to strings
            else if (node[_c] === Boolean || node[_c] === Number) {
                node = node + ''
            }

            // handle none node Nodes : textNodes
            if (node[_c] === String) {
                return document.createTextNode(node+'')
            }


            // not a text node 
            var el = document.createElement(node.type);

            // diff and update/add/remove props
            setElementProps(el, node.props);
            // add events if any
            addEventListeners(el, node.props);

            // only map children arrays
            if (node.children[_c] === Array) {
                node.children.map(createElement).forEach(el.appendChild.bind(el))
            }

            return el
        }


        // diffing (simple)
        function changed(node1, node2) {
                // diff object type
            var isType  = node1[_c] !== node2[_c],
                // diff content
                isDiff  = node1[_c] === String && node1 !== node2,
                // diff dom type
                hasType = node1.type !== node2.type;

            return isType || isDiff || hasType
        }

        function validate(a) {
            // converts 0 | false to strings
            if (a !== void 0 && (a === null || a === 0 || a === false)) {
                a = a + ''
            }

            return a
        }

        // update
        function update(parent, newNode, oldNode, index) {
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

        // loop through parents/root elements and update them
        function refresh(a, b, c) {
            // mount
            each(a, function(a) {
                update(a, b, c)
            })
        }

        function state(a) {
            var state = {};

            each(a, function(a,b,c) {
                state[b] = a();
            });

            return state;
        }

        // vdom public interface
        function vdom() {
            this.state = c,
            this.behavior = d,
            this.root = !!a.nodeType ? [a] : Array[_p].slice.call(a),
            this.raw = b,
            this.h = b(state(c), d);

            // mount
            refresh(this.root, this.h);
            // update
            this.update()
        }

        // refresh/update dom
        vdom[_p].update = function() {
            // get latest change
            var newNode = this.raw(state(this.state), this.behavior),
            // get old copy
                oldNode = this.h;

            refresh(this.root, newNode, oldNode);

            // update old node
            this.h = newNode
        }

        return new vdom
    }


    /* -------------------------------------------------------------- */


    /**
     * component constructor
     * 
     * @param  {Object} opts `component options`
     * @return {Void 0}
     */
    function cmp (opts) {
        // assign routes
        if (opts.routes && opts.routes[_c] === Array) {
            this.routes = {};

            for (var a = opts.routes, i = a.length - 1; i >= 0; i--) {
                this.routes[a[i].id] = a[i]
            }
        }

        // assign initial objects
        if (opts.state) {
            this.state = p(opts.state)
        }
        if (opts.behavior) {
            this.behavior = opts.behavior
        }
        if (opts.component) {
            this.component = opts.component
        }
    }

    /**
     * initialize component
     * 
     * @param  {ELement} a `element to mount to`
     * @param  {Object}  b `optional update state object`
     * @return {Object}    `componet object`
     */
    cmp[_p].mount = function(a, b) {
        var self = this;

        if (!a) {
            throw 'Needs dom element to mount'
        }
        else if (b) {
            self.state(b)
        }

        // set prop states
        iterate(self.state(), function(key, obj) {
            return p(obj[key])
        });

        // assign behavior
        if (self.behavior) {
            var behavior = self.behavior.bind(self.behavior, 
                    // state
                    self.state(), 
                    // update
                    function() { self.update(); },
                    // req
                    function(a, b, c) { self.req(a, b, c); },
                    // loop
                    self.loop()
                );

            self.behavior = new behavior
        }

        // init and add to dom element
        self.component = vdom(a, this.component, self.state(), self.behavior);

        // process constructor behavior
        if (self.behavior[_c]) {
            self.behavior[_c]()
        }

        return this
    };

    /**
     * update component
     * 
     * @return {Void 0}
     * 
     * @example
     * var cmp = c(opts).init();
     * cmp.update();
     */
    cmp[_p].update = function() {
        if (!window['_raf'] || !window['_raf'].active) {
            this.component.update()
        }
    }

    /**
     * redraw loop, redraws updates, throttled at 60fps
     * 
     * @return {Void 0}
     */
    cmp[_p].loop = function() {
        var self = this;

        return {
            start: function(a) {
                window['_raf'] = {
                    id: null,
                    active: null
                };

                fps(function() {
                    self.component.update();

                    if(a && window['_raf'].id === a) {
                        cancelAnimationFrame(window['_raf'].id)
                    }
                }, 60, window['_raf'])
            },
            stop: function() {
                cancelAnimationFrame(window['_raf'].id);
                window['_raf'].active = false
            }
        }
    }

    /**
     * req
     *
     * @public
     * @param  {String}   id       `id of route`
     * @param  {Object}   data     `data to pass to request`
     * @param  {Function} callback `function to run on success`
     * @return {Object}            `xhr object / xhr promise`
     *
     * @example
     * // returns {done, success, error, ...} | xhr object
     * req('api', {person: 'Sultan'}, fn(data) => {})
     */
    cmp[_p].req = function(id, data, callback) {
        var settings, 
            route;

        if (!!!this.routes[id]) {
            throw 'unknown route:'+id
        }

        // prep request settings
        route        = {},
        route.type   = this.routes[id].type.toUpperCase(),
        route.url    = (this.routes[id].type === 'GET') ? tmpl(this.routes[id].url).data(data) : this.routes[id].url;

        settings = {
            url: (route.url) ? route.url : null,
            method: (route.type) ? route.type : 'GET',
            data: (data) ? data : null,
        };
        
        // process
        ajax(settings, callback)
    }

    return new cmp(opts)
}