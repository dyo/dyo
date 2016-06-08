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
 */
function h(type, props) {
    var len = arguments.length,
        key = 2,
        children = [],
        child;

    if (props && props.constructor !== Object) {
        key = 1;
    }

    for (var i = key;i < len; i++) {
        var child = arguments[i];

        if (child && child.constructor === Array) {
            for (var k = 0; k < child.length; k++)
                children[ (i-key) + k ] = child[k];
        } else
            children[i - key] = child;
    }

    props = props && props.constructor === Object ? props : {};

    function h(a, b, c) {
        this.type = a,
        this.props = b,
        this.children = c;
    };

    return new h(type, props, children);
}


/**
 * create property/dynamic state p()
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
            return b;
        }
        prop.toJSON = function () {
            return JSON.stringify(b);
        }
        return prop;
    }(a);
}


/**
 * Polyfills
 *
 * @global Object.assign({}, obj, obj)
 * @global requestAnimationFrame(Function)
 */
(function() {
    // Object.assign Polyfill
    if (typeof Object.assign !== 'function' ) {
        Object.assign = function(target) {
            target = Object(target);

            for (var i = 1; i < arguments.length; i++) {
                var source = arguments[i];

                if (source !== null) {
                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key))
                            target[key] = source[key];
                    }
                }
            }
            return target;
        };
    }

    // requestAnimationFrame Polyfill
    var raf = 'requestAnimationFrame';

    if (typeof window[raf] !== 'function' ) {
        for(var x = 0; x < v.length && !window[raf]; ++x) {
            window[raf] = window[v[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[v[x]+'CancelAnimationFrame'] 
                                       || window[v[x]+'CancelRequestAnimationFrame'];
        }
    }
}());


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
     
        return (function loop(time){
            raf.id = requestAnimationFrame(loop);
            raf.active = true;

            var now = new Date().getTime(),
                delta = now - then;
     
            if (delta > interval) {
                then = now - (delta % interval);
                fn(time);
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
                    );
                }

                return a;
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
            return obj[i];
        });
    }

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
                encodeURIComponent(d) + '=' + encodeURIComponent(v));
        }

        return c.join('&');
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

        var CORS = !(
            a.hostname === location.hostname &&
            a.port === location.port &&
            a.protocol === location.protocol &&
            location.protocol !== 'file:'
        );

        xhr.open(settings.method, settings.url, true);

        xhr.onerror = function() {
            callback(this, true);
        };

        xhr.onload = function(res, response) {
            if(!callback) return;

            if (this.status >= 200 && this.status < 400) {
                var type = xhr.getResponseHeader("content-type"),
                    type = type.split(';'),
                    type = type[0].split('/'),
                    type = type[type.length-1];

                if (type === 'json')
                    response = JSON.parse(xhr.responseText);
                else if (type === 'html')
                    response = (new DOMParser()).parseFromString(xhr.responseText, "text/html");
                else
                    response = xhr.responseText;

                res = [response, false];
            } else {
                res = [this, true];
            }

            callback(res[0], res[1]);
        };

        if (CORS)
            xhr.withCredentials = true;

        if (settings.method !== 'GET')
            xhr.setRequestHeader(
                'Content-Type', 
                settings.data.constructor === Object ? 'application/json' : 'text/plain'
            );

        if (settings.method === 'POST') {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(param(settings)); 
        } else
            xhr.send();

        return xhr;
    }

    /**
     * clone objects
     * @param  {Object} obj `object to clone`
     * @return {Object}     `copy of object`
     *
     * @example
     * clone({id: 1234});
     */
    function clone(obj) {
        var copy;

        // Handle the 3 simple types, and null or undefined
        if (obj === null || typeof obj !== 'object') return obj;

        // Handle Date
        if (obj.constructor === Date) {
            copy = new Date();
            copy.setTime(obj.getTime());
            return copy;
        }
        // Handle Array
        else if (obj.constructor === Array) {
            copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone(obj[i]);
            }
            return copy;
        }
        // Handle Object
        else if (typeof obj === 'object') {
            copy = {};
            for (var attr in obj) {
                if (!!obj[attr]) 
                    copy[attr] = clone(obj[attr]);
            }
            return copy;
        }

        throw new Error("Unable to copy obj!");
    }

    /**
     * object iterate + update
     * 
     * @param  {Object}   obj       `object to change`
     * @param  {Function} condition `when to change`
     * @param  {Function} result    `what to change`
     * @return {Object}             `changed object`
     */
    function iterate(obj, result) {
        for (var key in obj) {

            if (result) {
                var r = result(key, obj);
                if (r) obj[key] = r;
            }

            // Recurse into children
            if (obj[key] !== null && typeof obj[key] === 'object')
                iterate(obj[key], result);
        }

        return obj;
    }


    /* -------------------------------------------------------------- */


    function vdom(a, b, c) {
        // events
        function isEventProp(name) {
            return /^on/.test(name);
        }

        function extractEventName(name) {
            return name.substring(2, name.length).toLowerCase();
        }

        function addEventListeners(target, props) {
            for (var name in props) {
                if (isEventProp(name)) {
                    var cb = props[name];

                    if (cb.constructor !== Function)
                        cb = !!c.behavior[cb] ? c.behavior[cb] : null;

                    if (cb)
                        target.addEventListener(extractEventName(name), cb, false);
                }
            }
        }

        // assign/update/remove props
        function prop(target, name, value, op) {
            if (isEventProp(name)) return;

            var attr = (op === -1 ? 'remove' : 'set') + 'Attribute';

            if (value.constructor === Boolean) {
                if (op === -1) {
                    target[attr](name);
                    target[name] = false;
                } else {
                    if (value) {
                        target[attr](name, value);
                        target[name] = true;
                    } 
                    else
                        target[name] = false;
                }
            } else {
                return op === -1 ? target[attr](name) : target[attr](name, value);
            }
        }

        function updateElementProp(target, name, newVal, oldVal) {
            if (!newVal)
                prop(target, name, oldVal, -1);
            else if (!oldVal || newVal !== oldVal)
                prop(target, name, newVal, +1);
        }

        function updateElementProps(target, newProps) {
            var oldProps = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2],
                props = Object.assign({}, newProps, oldProps);

            for (var name in props)
                updateElementProp(target, name, newProps[name], oldProps[name]);
        }

        function setElementProps(target, props) {
            for (var name in props)
                prop(target, name, props[name], +1);
        }


        // create element
        function createElement(node) {
            if (node === void 0) node = '';
            if (node.constructor === String)
                return document.createTextNode(node);

            var el = document.createElement(node.type);

            setElementProps(el, node.props);
            addEventListeners(el, node.props);

            node.children.map(createElement).forEach(el.appendChild.bind(el));

            return el;
        }


        // main
        function changed(node1, node2) {
            var isType  = node1.constructor !== node2.constructor,
                isDiff  = node1.constructor === String && node1 !== node2,
                hasType = node1.type !== node2.type;

            return isType || isDiff || hasType;
        }

        function update(parent, newNode, oldNode, index) {
            index = index | 0;

            if (!oldNode && newNode)
                parent.appendChild(createElement(newNode));
            else if (!newNode)
                parent.removeChild(parent.childNodes[index]);
            else if (changed(newNode, oldNode))
                parent.replaceChild(createElement(newNode), parent.childNodes[index]);
            else if (newNode.type) {
                updateElementProps(parent.childNodes[index], newNode.props, oldNode.props);

                var newLength = newNode.children.length,
                    oldLength = oldNode.children.length;

                for (var i = 0; i < newLength || i < oldLength; i++)
                    update(parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
            }
        }


        // resolve vdom objects
        function res(obj) {
            iterate(obj,
                function(key, obj) {
                    var type = obj[key];

                    if (type && type.constructor) type = type.constructor;
                    else return;

                    if (!!obj[key].toJSON) {
                        return obj[key]() + '';
                    } else if (
                        type === Function || 
                        type === Object || 
                        type === Array || 
                        type === Boolean
                    ) {
                        return obj[key];
                    } else if (type === String) {
                        return obj[key] ? obj[key] + '' : obj[key] + ' ';
                    } else {
                        return obj[key] + '';
                    }
                }
            );

            return obj;
        };


        // vdom public interface
        function vdom() {
            this.root = a;

            if (b) {
                this.mount(b);
                this.init();
            }
        }

        vdom.prototype.mount = function(a) {
            this.obj = a;
            this.res = res(clone(a));
            return this;
        }

        vdom.prototype.init = function() {
            update(this.root, this.res);
            return this;
        }

        vdom.prototype.update = function(a) {
            if (a) {
                update(this.root, res(a), this.res);
                this.mount(a);
            } else {
                update(this.root, res(clone(this.obj)), this.res);
            }
            return this;
        }

        return new vdom;
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
        if (opts.routes && opts.routes.constructor === Array) {
            this.routes = {};

            for (var i = 0, a = opts.routes; i < a.length; i++)
                this.routes[a[i].id] = a[i];
        }

        // assign initial objects
        if (opts.state) this.state = p(opts.state);
        if (opts.behavior) this.behavior = opts.behavior;
        if (opts.component) this.component = opts.component;
    }

    /**
     * initialize component
     * 
     * @param  {ELement} a `element to mount to`
     * @param  {Object} b  `optional update state object`
     * @return {Object}    `componet object`
     */
    cmp.prototype.init = function(a, b) {
        var self = this;

        if (!a)
            throw 'Needs dom element to mount';
        else if (b)
            this.state(b);

        // set prop states
        iterate(this.state(), 
            function(key, obj) {
                return p(obj[key]); 
            }
        );

        // assign behavior
        if (this.behavior) {
            var behavior = this.behavior.bind(this.behavior, 
                    // state
                    function(a, b) {
                        var s = self.state();

                        if (a && s[a]) return b ? s[a](b) : s[a]();
                        else return s;
                    }, 
                    // update
                    function() {
                        self.update();
                    },
                    // req
                    function (a, b, c) {
                        self.req(a, b, c);
                    },
                    // loop
                    self.loop(),
                    function(a) {
                        return a ? 
                            Array.prototype.slice.call(self.component.querySelectorAll(a)) : 
                            self.component;
                    }
                );

            this.behavior = new behavior;
        }

        // assign component
        if (this.component) {
            this.component = this.component.constructor === Function ? this.component(this.state(), this.behavior) : this.component;
        }

        // init and add to dom element
        this.vdom = vdom(a, this.component, this);

        this.component = a;

        if (this.behavior.constructor)
            this.behavior.constructor();

        return this;
    };

    /**
     * update component
     * 
     * @return {Void 0}
     * @example
     * var cmp = c(opts).init();
     * cmp.update();
     */
    cmp.prototype.update = function() {
        this.vdom.update();
    }

    /**
     * redraw loop, redraws updates, throttled at 60fps
     * 
     * @return {Void 0}
     */
    cmp.prototype.loop = function() {
        var self = this;

        return {
            start: function(a) {
                window._raf = {
                    id: null,
                    active: null
                };

                fps(function() {
                    self.update();

                    if(a && window._raf.id === a)
                        cancelAnimationFrame(window._raf.id);
                }, 60, window._raf);
            },
            stop: function() {
                cancelAnimationFrame(window._raf.id);
                window._raf.active = false;
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
    cmp.prototype.req = function(id, data, callback) {
        var settings, 
            route;

        if (!!!this.routes[id])
            throw 'unknown route:'+id;

        route        = {};
        route.type   = this.routes[id].type.toUpperCase();
        route.url    = (this.routes[id].type === 'GET') ? tmpl(this.routes[id].url).data(data) : this.routes[id].url;

        settings = {
            url:      (route.url)    ? route.url     : null,
            method:   (route.type)   ? route.type    : 'GET',
            data:     (data)         ? data          : null,
        };
        
        ajax(settings, callback);
    }

    return new cmp(opts);
}