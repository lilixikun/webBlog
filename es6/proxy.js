//ES6 原生提供 Proxy 构造函数，用来生成 Proxy 实例。

// var proxy=new Proxy(targen,handler)
let proxy = new Proxy({}, {
    get: function (target, propKey) {
        return 35;
    }
})

proxy.time;//35
proxy.name;//35

//如果handler没有设置任何拦截，那就等同于直接通向原对象。
var target = {};
var handler = {};
var proxy = new Proxy(target, handler);
proxy.a = 'b';
target.a;// b

//同一个拦截函数,可以设置拦截多个操作
var handler = {
    get: function (target, name) {
        if (name === 'prototype') {
            return Object.prototype;
        }
        return 'Hello,' + name;
    },

    apply: function (target, thisBinding, args) {
        return args[0];
    },
    construct: function (target, args) {
        console.log(target, args);

        return { value: args[1] }
    }
}

var fproxy = new Proxy(function (x, y) {
    return x + y;
}, handler);
fproxy(1, 2); //1
new fproxy(1, 2); //{value:2}
fproxy.prototype === Object.prototype; //true
fproxy.foo === "hello,foo"; //true



//apply 拦截函数的调用,call和apply的操作
var handler = {
    apply(target, ctx, args) {
        return Reflect.apply(arguments);
    }
}
// web 服务的客户端
function creatWebService(baseUrl) {
    return new Proxy({}, {
        get(target, propKey, receiver) {
            return () => httpGet(baseUrl + "/", +propKey);
        }
    })
}

