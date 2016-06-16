/**
 * Surl - Virtual Dom Library
 *
 * @author Sultan Tarimo <https://github.com/sultantarimo>
 */

(function () {
    /**
     * requestAnimationFrame Polyfill
     */
    var raf = 'requestAnimationFrame',
        caf = 'cancelAnimationFrame',
        lastTime = 0,
        v = ['webkit', 'moz'],
        vl = v.length,
        af = 'AnimationFrame';

    for (var x = 0; x < vl && !window[raf]; ++x) {
        window[raf] = window[v[x]+'Request'+af];
        window[caf] = window[v[x]+'Cancel'+af]||window[v[x]+'CancelRequest'+af]
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


(function () {
    'use strict';
    
    // common references
    var _c = 'constructor',
        _namespace = {
            math: 'http://www.w3.org/1998/Math/MathML',
            svg: 'http://www.w3.org/2000/svg',
            xlink: 'http://www.w3.org/1999/xlink'
        }


    /* -------------------------------------------------------------- */


    /**
     * hyperscript tagger
     *
     * @private
     * @param  {Object} a `object with opt props key`
     * @param  {Object} b `tag`
     * @return {[Object]} `{props, type}`
     *
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
     *
     * @private
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
     *
     * @private
     * @param  {String} type  `Element, i.e: div`
     * @param  {Object} props `optional properties`
     * @return {Object}       '{type, props, children}'
     *
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

    /**
     * create property/dynamic state p()
     * the backbone of the flow of data
     *
     * @private
     * @param  {Any} a `set value`
     * @return {Any}   `value set`
     *
     * @example
     * var a = p(new Date());
     * a() // date object
     * a.toJSON() // string object
     */
    function prop (a) {
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

    /**
     * bind to element
     *
     * @private
     * @param  {String}  val  `value to watch for in element`
     * @param  {p}       to   `p() prop to update`
     * @param  {Element} from `element bound to, defaults to element attached to`
     * @return {Void}
     *
     * @example
     * h('input[type=checkbox]', {onChange: b('checked', state.data)})
     */
    function bind (val, to, from) {
        return function (e) {
            // default to window event if not passed
            e = e || window.event;

            // current target
            var current = e.current || this,
                from = from || this,
                // target has this value ?
                target = (val in current) ?
                // true get prop value
                    current[val] :
                    // get attribute instead
                    current.getAttribute(val);

            // update prop
            to.call(from, target)
        }
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


    /**
     * add helper references to window object
     * for prop, hyperscript and bind
     * 
     * @type {Function}
     */
    window.p = window.prop = prop,
    window.b = window.bind = bind,
    window.h = hyperscript;
    window.animate = animate;


    /* -------------------------------------------------------------- */


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
     *
     * @private
     * @param  {Object}   settings `ajax settings object`
     * @param  {Function} callback `function to run onload`
     * @return {Void}
     *
     * @example
     * // returns xhr Object
     * ajax({url, method, data}, fn(res, err) => {})
     */
    function ajax (settings, callback) {
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
            a = null;

        xhr.open(settings.method, settings.url, true);

        xhr.onerror = function () {
            callback(this, true)
        };

        xhr.onload = function () {
            // no callback specified
            // if (!callback) return 0;
            if (callback) {
                var res, response;
    
                if (this.status >= 200 && this.status < 400) {
                    // determine return data type
                    var type = xhr.getResponseHeader("content-type");
                    var typeArr = type.split(';');
                        typeArr = type[0].split('/');
                        type = typeArr[typeArr.length-1];
    
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
            }
        }

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
    function merge (a, b, c) {
        for (var name in b) { a[name] = b[name] }
        for (var name in c) { a[name] = c[name] }
        return c
    }

    /**
     * template parser
     * 
     * @private
     * @param  {String} a `string to parse`
     * @return {Object}   `{data: (data) => {}}`
     *
     * * @example
     * // returns 'Hello World'
     * tmpl('Hello, {person}').data({person: 'World'})
     */
    function tmpl (a, b) {
        for (var item in b) {
            a = a.replace( 
                new RegExp('{'+item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +'}', 'g'),
                esc(b[item]) 
            )
        }

        return a
    }

    /**
     * escape string
     * 
     * @private
     * @param  {String} a `string to escape`
     * @return {String}   `escaped string`
     */
    function esc (a) {
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
     * forEach helper
     *
     * @private
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
     * Surl - create instance
     *
     * @global
     * @param  {Object} options `descriping component`
     * @return {Object}         `instance of created component`
     *
     * @example
     * surl()
     *     .view(view)
     *     .methods(methods)
     *     .state(state)
     *     .routes(routes)
     *     .mount(document)
     *     
     * view (state, methods) => {
     *     return hyperscript object
     * }
     *
     * methods (state, update, request, loop) => {
     *     return methods object
     * }
     *
     * state {
     *     data: 12
     *     data2: 232
     * }
     *
     * routes [
     *     {id: 'api1',type:'GET', url: '/api/{secret}'}
     * ]
     */
    function surl () {
        var self = this;

        return {
            view: function(a) {
                self.view = a;
                return this
            },
            ctrl: function(a) {
                self.ctrl = a;
                return this
            },
            state: function(a) {
                self.state = a;
                return this
            },
            mount: function(a) {
                self.mount(a)
                return self
            },
            routes: function(a) {
                self.routes = a
                return this
            }
        }
    }

    surl.prototype = {
        /**
         * Virtual Dom
         *
         * @public
         * @param  {Element}  a `root element`
         * @param  {Function} b `hyperscript function`
         * @return {Oject}      `vdom object`
         */
        vdom: function (root, fn) {
            var self = this;

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
        
                        // not directly references, 
                        // check if string value is a defined methods
                        if (callback[_c] !== Function) {
                            callback = !!self.ctrl[callback] ? self.ctrl[callback] : null
                        }
        
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
        
            // vdom public interface
            function vdom () {
                // root reference
                this.root = root,
                // local copy of dynamic hyperscript reference
                this.fn = fn,
                // local copy of static hyperscript refence
                this.oldNode = this.fn(self.state, self.ctrl);
                // mount
                update(this.root, this.oldNode);
                // update
                this.update()
            }
            // refresh/update dom
            vdom.prototype.update = function () {
                // get latest change
                var newNode = this.fn(self.state, self.ctrl),
                    // get old copy
                    oldNode = this.oldNode;

                update(this.root, newNode, oldNode);
        
                // update old node
                this.oldNode = newNode
            }
        
            return new vdom
        },

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
        req: function (id, data, callback) {
            var settings, 
                route;
        
            if (!this.routes || !!!this.routes[id]) {
                throw 'unknown route:'+id
            }
        
            // prep request settings
            route        = {},
            route.type   = this.routes[id].type.toUpperCase(),
            route.url    = (this.routes[id].type === 'GET') ? tmpl(this.routes[id].url, data) : this.routes[id].url;
        
            settings = {
                url: (route.url) ? route.url : null,
                method: (route.type) ? route.type : 'GET',
                data: (data) ? data : null,
            };
            
            // process
            ajax(settings, callback)
        },

        /**
         * requestAnimation loop
         *
         * @param  {Function} fn  `loop`
         * @param  {fps}      fps `frames per second`
         * @return {Object}       `raf object`
         */
        fps: function (fn, fps, raf) {
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
            }(0))
        },

        /**
         * redraw loop, redraws updates, throttled at 60fps
         *
         * @public
         * @return {Void}
         */
        loop: function () {
            var self = this;
        
            return {
                start: function (a) {
                    window._raf = {
                        id: null,
                        active: null
                    }
        
                    self.fps(function () {
                        self.update();
        
                        if (a && window._raf.id === a) {
                            cancelAnimationFrame(window._raf.id)
                        }
                    }, 60, window._raf)
                },
                stop: function () {
                    cancelAnimationFrame(window._raf.id);
                    window._raf.active = false
                }
            }
        },

        /**
         * update component
         *
         * @public
         * @return {Void}
         * 
         * @example
         * var cmp = c(opts).init();
         * cmp.update();
         */
        update: function () {
            this.view.update()
        },

        /**
         * mount component to dom
         *
         * @public
         * @param  {ELement} a `element to mount to`
         * @return {Object}    `componet object`
         */
        mount: function (root) {
            var self = this;

            // set prop states
            if (self.state) {
                each(self.state, function(a, b, c) {
                    c[b] = prop(a)
                });
            }
            
            // assign methods
            if (self.ctrl) {
                self.ctrl = self.ctrl.call(
                    self,
                    self.state, 
                    function () { 
                        self.update() 
                    },
                    function (a, b, c) { 
                        self.req(a, b, c)
                    },
                    self.loop()
                )
            }

            // on document ready mount to dom element    
            document.onreadystatechange = function () {
                if (document.readyState === 'interactive') {
                    // check if is element passed is a document node
                    if (root === document) {
                        root = document.body
                    } else if (root && root.constructor === String) {
                        root = document.querySelector(root)
                    } 
                    
                    // can't the element
                    if (!root || !root.nodeType) {
                        throw 'Please ensure the DOM element exists'
                    }
                    
                    // clear dom element for mount
                    if (root.innerHTML.length !== 0) {
                        root.innerHTML = ''
                    }

                    // process constructor method
                    if (self.ctrl[_c]) {
                        self.ctrl[_c]()
                    }
        
                    // initialize and add to dom element
                    self.view = self.vdom(root, self.view);
                }
            }
        }
    }
    
    window.surl = function(){
        return new surl()
    }
}())