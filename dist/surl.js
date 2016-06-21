(function () {
    'use strict';
    (function () {
        var raf = 'requestAnimationFrame', caf = 'cancelAnimationFrame', v = ['ms', 'moz', 'webkit'], vl = v.length, af = 'AnimationFrame', lt = 0, w = window;
        for (var x = 0; x < vl && !w[raf]; ++x) {
            w[raf] = w[v[x] + 'Request' + af];
            w[caf] = w[v[x] + 'Cancel' + af] || w[v[x] + 'CancelRequest' + af];
        }
        if (!w[raf]) {
            w[raf] = function (callback) {
                var currTime = new Date().getTime(), timeToCall = Math.max(0, 16 - (currTime - lt)), id = w.setTimeout(function () {
                    callback(currTime + timeToCall);
                }, timeToCall);
                lt = currTime + timeToCall;
                return id;
            };
        }
        if (!w[caf]) {
            w[caf] = function (id) {
                clearTimeout(id);
            };
        }
    }());
    var namespaces = {
        math: 'http://www.w3.org/1998/Math/MathML',
        svg: 'http://www.w3.org/2000/svg',
        xlink: 'http://www.w3.org/1999/xlink'
    };
    function each(arg, callback) {
        var index = 0, name;
        if (arg.constructor === Array) {
            var arr = arg, length_1 = arr.length;
            for (; index < length_1; ++index) {
                if (callback.call(arr[index], arr[index], index, arr) === false) {
                    return arr;
                }
            }
        }
        else {
            var obj = arg;
            for (name in obj) {
                if (callback.call(obj[name], obj[name], name, obj) === false) {
                    return obj;
                }
            }
        }
    }
    function raf(callback, fps, raf) {
        var then = new Date().getTime();
        fps = fps || 60;
        var interval = 1000 / fps;
        return (function loop(time) {
            raf.id = requestAnimationFrame(loop);
            var now = new Date().getTime(), delta = now - then;
            if (delta > interval) {
                then = now - (delta % interval);
                callback(time);
            }
        }(0));
    }
    function param(arg) {
        var arr = [];
        for (var name_1 in arg) {
            var value = arg[name_1];
            arr.push(typeof value == 'object' ? param(value) :
                encodeURIComponent(name_1) + '=' + encodeURIComponent(value));
        }
        return arr.join('&');
    }
    function ajax(settings) {
        var xhr = new XMLHttpRequest(), location = window.location, url = settings.url, callback = settings.callback, method = settings.method, data = settings.data, a = document.createElement('a');
        a.href = url;
        var CORS = !(a.hostname === location.hostname &&
            a.port === location.port &&
            a.protocol === location.protocol &&
            location.protocol !== 'file:');
        a = null;
        xhr.open(method, url, true);
        xhr.onerror = function () {
            callback(this, true);
        };
        xhr.onload = function () {
            if (callback) {
                var params = void 0, response = void 0;
                if (this.status >= 200 && this.status < 400) {
                    var type = xhr.getResponseHeader("content-type"), typeArr = type.split(';');
                    typeArr = type[0].split('/');
                    type = typeArr[typeArr.length - 1];
                    if (type === 'json') {
                        response = JSON.parse(xhr.responseText);
                    }
                    else if (type === 'html') {
                        response = (new DOMParser()).parseFromString(xhr.responseText, "text/html");
                    }
                    else {
                        response = xhr.responseText;
                    }
                    params = [response, false];
                }
                else {
                    params = [this, true];
                }
                callback(params[0], params[1]);
            }
        };
        if (CORS) {
            xhr.withCredentials = true;
        }
        if (method !== 'GET') {
            xhr.setRequestHeader('Content-Type', data.constructor === Object ? 'application/json' : 'text/plain');
        }
        if (method === 'POST') {
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhr.send(param(settings));
        }
        else {
            xhr.send();
        }
        return xhr;
    }
    var surl = (function () {
        function surl(parent) {
            var self = this;
            if (parent) {
                self.parent = self.__$(parent);
            }
            self.settings = { loop: true },
                self.router = {
                    nav: function (url) {
                        history.pushState(null, null, url);
                    },
                    back: function () {
                        history.back();
                    },
                    foward: function () {
                        history.foward();
                    },
                    go: function (index) {
                        history.go(index);
                    },
                    destroy: function () {
                        this.routes = {};
                        cancelAnimationFrame(this.raf.id);
                    },
                    listen: function () {
                        var self = this, loc = window.location;
                        self.url = null;
                        self.raf = { id: 0 };
                        raf(function () {
                            var url = loc.href;
                            if (self.url !== url) {
                                self.url = url;
                                self.changed();
                            }
                        }, 60, self.raf);
                    },
                    on: function (url, callback) {
                        var self = this, routes;
                        if (!self.routes) {
                            self.routes = {};
                        }
                        if (!self.raf) {
                            self.listen();
                        }
                        if (url.constructor !== Object) {
                            var args = arguments;
                            routes = {};
                            routes[args[0]] = args[1];
                        }
                        else {
                            routes = url;
                        }
                        each(routes, function (callback, name) {
                            var variables = [], regex = /([:*])(\w+)|([\*])/g, pattern = name.replace(regex, function () {
                                var args = arguments, id = args[2];
                                if (!id) {
                                    return '(?:.*)';
                                }
                                else {
                                    variables.push(id);
                                    return '([^\/]+)';
                                }
                            });
                            self.routes[name] = {
                                callback: callback,
                                pattern: pattern,
                                variables: variables
                            };
                        });
                    },
                    changed: function () {
                        var _self = this;
                        each(_self.routes, function (val) {
                            var callback = val.callback, pattern = val.pattern, variables = val.variables, url = _self.url, match;
                            match = url.match(new RegExp(pattern));
                            if (match) {
                                var args = match
                                    .slice(1, match.length)
                                    .reduce(function (args, val, i) {
                                    if (!args) {
                                        args = {};
                                    }
                                    args[variables[i]] = val;
                                    return args;
                                }, null);
                                if (callback.constructor === Function) {
                                    callback(args);
                                }
                                else if (callback.hasOwnProperty('render')) {
                                    self.mount(callback, null, args);
                                }
                                else {
                                    throw 'could not find the render method';
                                }
                            }
                        }.bind(this));
                    }
                };
        }
        surl.prototype.__vdom = function () {
            function isEventProp(name) {
                return name.substring(0, 2) === 'on';
            }
            function extractEventName(name) {
                return name.substring(2, name.length).toLowerCase();
            }
            function addEventListeners(target, props) {
                for (var name_2 in props) {
                    if (isEventProp(name_2)) {
                        var callback = props[name_2];
                        if (callback) {
                            target.addEventListener(extractEventName(name_2), callback, false);
                        }
                    }
                }
            }
            function prop(target, name, value, op) {
                if (isEventProp(name)) {
                    return;
                }
                var attr = (op === -1 ? 'remove' : 'set') + 'Attribute';
                if (target[name] !== void 0 &&
                    target.namespaceURI !== namespaces['svg']) {
                    target[name] = value;
                }
                if (name === 'xlink:href') {
                    return target.setAttributeNS(namespaces['xlink'], 'href', value);
                }
                if (value !== namespaces['svg'] &&
                    value !== namespaces['math']) {
                    return op === -1 ? target[attr](name) : target[attr](name, value);
                }
            }
            function updateElementProp(target, name, newVal, oldVal) {
                if (!newVal) {
                    prop(target, name, oldVal, -1);
                }
                else if (!oldVal || newVal !== oldVal) {
                    prop(target, name, newVal, +1);
                }
            }
            function updateElementProps(target, newProps, oldProps) {
                oldProps = oldProps !== void 0 ? oldProps : {};
                var props = {};
                for (var name_3 in newProps) {
                    props[name_3] = newProps[name_3];
                }
                for (var name_4 in oldProps) {
                    props[name_4] = oldProps[name_4];
                }
                for (var name_5 in props) {
                    updateElementProp(target, name_5, newProps[name_5], oldProps[name_5]);
                }
            }
            function setElementProps(target, props) {
                for (var name_6 in props) {
                    prop(target, name_6, props[name_6], +1);
                }
            }
            function createElement(node) {
                if (node.constructor === String) {
                    return document.createTextNode(node);
                }
                var el;
                if (!node.render) {
                    if (node.props && node.props.xmlns) {
                        el = document.createElementNS(node.props.xmlns, node.type);
                    }
                    else {
                        el = document.createElement(node.type);
                    }
                    setElementProps(el, node.props);
                    addEventListeners(el, node.props);
                    if (node.children && node.children.constructor === Array) {
                        each(node.children.map(createElement), el.appendChild.bind(el));
                    }
                }
                else {
                    el = node.render.parent;
                }
                return el;
            }
            function changed(node1, node2) {
                var isDiffType = node1.constructor !== node1.constructor, isDiffText = node1.constructor === String && node1 !== node2, isDiffDom = node1.type !== node2.type;
                return isDiffType || isDiffText || isDiffDom;
            }
            function validate(arg) {
                if (arg !== void 0 && (arg === null || arg === 0 || arg === false)) {
                    arg = arg + '';
                }
                return arg;
            }
            function update(parent, newNode, oldNode, index) {
                index = index ? index : 0;
                oldNode = validate(oldNode);
                newNode = validate(newNode);
                if (!oldNode) {
                    parent.appendChild(createElement(newNode));
                }
                else if (!newNode) {
                    parent.removeChild(parent.childNodes[index]);
                }
                else if (changed(newNode, oldNode)) {
                    parent.replaceChild(createElement(newNode), parent.childNodes[index]);
                }
                else if (newNode.type) {
                    updateElementProps(parent.childNodes[index], newNode.props, oldNode.props);
                    var newLength = newNode.children.length, oldLength = oldNode.children.length;
                    for (var i = 0; i < newLength || i < oldLength; i++) {
                        update(parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
                    }
                }
            }
            var vdom = (function () {
                function vdom(parent, render) {
                    this.parent = parent,
                        this.fn = render;
                }
                vdom.prototype.update = function () {
                    var newNode = this.fn(), oldNode = this.old;
                    update(this.parent, newNode, oldNode);
                    this.old = newNode;
                };
                vdom.prototype.init = function () {
                    this.old = this.fn();
                    update(this.parent, this.old);
                };
                vdom.prototype.auto = function (start) {
                    var self = this;
                    if (start) {
                        self.raf = {
                            id: 1
                        };
                        raf(function () {
                            self.update();
                        }, 60, self.raf);
                    }
                    else {
                        setTimeout(function () {
                            cancelAnimationFrame(self.raf.id);
                        }, 0);
                        return self.raf.id;
                    }
                };
                return vdom;
            }());
            return vdom;
        };
        surl.prototype.__$ = function (element) {
            if (element === document) {
                element = element.body;
            }
            else if (element.constructor === String) {
                element = document.querySelector(element);
            }
            return element && element.nodeType ? element : void 0;
        };
        surl.prototype.req = function () {
            var args = arguments, settings = {
                method: 'GET',
                data: {},
                callback: function () { },
                url: ''
            };
            each(args, function (val) {
                if (val.constructor === Object) {
                    settings.data = val;
                }
                else if (val.constructor === Function) {
                    settings.callback = val;
                }
                else if (val.constructor === String) {
                    var type = val.toUpperCase();
                    if (type === 'POST' || type === 'GET') {
                        settings.method = type;
                    }
                    else {
                        settings.url = val;
                    }
                }
            });
            ajax(settings);
        };
        surl.prototype.mount = function (cmp, element, args) {
            var self = this;
            if (element) {
                self.parent = element;
            }
            if (self.parent) {
                self.parent.innerHTML = '';
                self.parent.appendChild(cmp.render.parent);
                if (cmp.__constructor) {
                    cmp.__constructor(args);
                }
            }
            else {
                throw 'the element to mount to does not exist';
            }
        };
        surl.prototype.component = function (cmp) {
            each(cmp, function (value, name, obj) {
                if (name !== 'render' && value.constructor === Function) {
                    obj[name] = value.bind(cmp);
                }
            });
            var parent = document.createElement('div');
            if (cmp.namespace) {
                parent.classList.add(cmp.namespace);
            }
            if (cmp.render.constructor === Function) {
                cmp.render = {
                    fn: cmp.render,
                    parent: parent
                };
                cmp.render.fn = cmp.render.fn.bind(cmp);
                var vdom = this.__vdom();
                cmp.render = new vdom(cmp.render.parent, cmp.render.fn);
                cmp.render.init();
                if (!!this.settings.loop) {
                    cmp.render.auto(true);
                }
            }
            return cmp;
        };
        return surl;
    }());
    function hyperscript(type, props) {
        var len = arguments.length, key = 2, obj = { type: type, props: props, children: [] };
        if (obj.props === null || obj.props === void 0 || obj.props.constructor !== Object) {
            obj.props = {};
        }
        if (obj.type.indexOf('[') !== -1 ||
            obj.type.indexOf('#') !== -1 ||
            obj.type.indexOf('.') !== -1) {
            obj = tag(obj);
        }
        if (obj.type === 'svg' || obj.type === 'math') {
            if (!obj.props.xmlns) {
                obj.props.xmlns = namespaces[obj.type];
            }
        }
        for (var i = key; i < len; i++) {
            var child = arguments[i];
            if (child && child.constructor === Array) {
                for (var k = 0; k < child.length; k++) {
                    obj.children[(i - key) + k] = set(child[k], obj);
                }
            }
            else {
                obj.children[i - key] = set(child, obj);
            }
        }
        return obj;
    }
    function set(arg, obj) {
        if (arg && arg.constructor === Object && obj.props.xmlns) {
            arg.props.xmlns = obj.props.xmlns;
        }
        arg = arg !== void 0 &&
            arg !== null &&
            (arg.constructor === Object ||
                arg.constructor === String ||
                arg.constructor === Array) ?
            arg :
            arg + '';
        arg = arg === 'null' || arg === 'undefined' ? '' : arg;
        return arg;
    }
    function tag(obj) {
        var classes = [], match, parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[(.+?)(?:\s*=\s*("|'|)((?:\\["'\]]|.)*?)\5)?\])/g, props = !obj.props ? {} : obj.props, type = obj.type;
        obj.type = 'div';
        while ((match = parser.exec(type))) {
            if (match[1] === '' && match[2]) {
                obj.type = match[2];
            }
            else if (match[1] === '#') {
                props.id = match[2];
            }
            else if (match[1] === '.') {
                classes.push(match[2]);
            }
            else if (match[3][0] === '[') {
                var attr = match[6];
                if (attr) {
                    attr = attr.replace(/\\(["'])/g, '$1');
                }
                props[match[4]] = attr || true;
            }
        }
        if (classes.length > 0) {
            props.class = classes.join(' ');
        }
        obj.props = props;
        return obj;
    }
    function animate() {
        var args, className, duration, transform, easing, element, first, last, invert, animation, webAnimations;
        first = last = invert = animation = {},
            args = Array.prototype.slice.call(arguments);
        for (var i = args.length - 1; i >= 0; i--) {
            var arg = args[i];
            if (arg.constructor === Array) {
                transform = arg.join(' ');
            }
            else if (arg.constructor === Number) {
                duration = arg;
            }
            else if (arg.constructor === String) {
                if (arg.indexOf(',') !== -1) {
                    easing = arg;
                }
                else {
                    className = arg;
                }
            }
            else if (!!arg.target) {
                element = arg.target;
            }
        }
        if (this.constructor === Number) {
            duration = this;
        }
        else if (this.constructor === String) {
            className = this;
        }
        else if (!className) {
            className = 'animation-active';
        }
        if (!className || !element) {
            return;
        }
        element.style.willChange = 'transform';
        first = element.getBoundingClientRect();
        element.classList.toggle(className);
        last = element.getBoundingClientRect();
        invert.x = first.left - last.left;
        invert.y = first.top - last.top;
        invert.sx = first.width / last.width;
        invert.sy = first.height / last.height;
        if (element.animate && element.animate.constructor === Function) {
            webAnimations = true;
        }
        animation.first = 'translate(' + invert.x + 'px,' + invert.y + 'px) translateZ(0)' + ' scale(' + invert.sx + ',' + invert.sy + ')',
            animation.first = transform ? animation.first + ' ' + transform : animation.first,
            animation.last = 'translate(0,0) translateZ(0) scale(1,1) rotate(0) skew(0)',
            animation.duration = duration ? duration : 200,
            animation.easing = easing ? 'cubic-bezier(' + easing + ')' : 'cubic-bezier(0,0,0.32,1)',
            element.style.transformOrigin = '0 0';
        element.classList.add('animation-running');
        document.body.classList.add('animation-running');
        document.body.classList.toggle('animation-active');
        if (webAnimations) {
            var player = element.animate([
                { transform: animation.first },
                { transform: animation.last }
            ], {
                duration: animation.duration,
                easing: animation.easing
            });
            player.addEventListener('finish', onfinish);
        }
        else {
            element.style.transform = animation.first;
            element.offsetWidth;
            element.style.transition = 'transform ' + animation.duration + 'ms ' + animation.easing,
                element.style.transform = animation.last;
        }
        function onfinish(e) {
            if (!webAnimations) {
                if (e.target != element) {
                    return;
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
    window.surl = surl;
    window.h = hyperscript;
    window.animate = animate;
}());
//# sourceMappingURL=surl.js.map