## new 的实现

使用new来调用函数，或者说发生构造函数调用时，会自动执行下面的操作：
- 创建一个空对象
- 链接到原型
- 绑定this值
- 返回新对象

利用 **Object.create** 实现如下：

```js
function _new(fn, ...args) {
    const obj = Object.create(fn.prototype)
    // 执行函数
    const res = fn.apply(obj, args)
    return res instanceof Object ? res : obj
}
```

利用 **__proto__** 实现:

```js
function _new() {
    const obj = new Object();
    const Fn = Array.prototype.shift.call(arguments)
    obj.__proto__ = Fn.prototype
    let res = Fn.apply(obj, arguments)
    return res instanceof Object ? res : obj
}
```

## call 实现

```js
Function.prototype.myCall = function (context, ...args) {

    context = context || window
    let fn = Symbol()
    context[fn] = this

    let res = context[fn](...args)
    delete context[fn]
    return res
}
```

## bind 实现

因为bind转换后的函数可以作为构造函数使用，此时this应该指向构造出的实例，而bind函数绑定的第一个参数。

```js
Function.prototype.myBind = function (context) {
    if (typeof this != "function") {
        throw Error("not a function")
    }
    // 若没问参数类型则从这开始写
    let fn = this;
    let args = [...arguments].slice(1);

    let resFn = function () {
        return fn.apply(this instanceof resFn ? this : context, args.concat(...arguments))
    }
    function tmp() { }
    tmp.prototype = this.prototype;
    resFn.prototype = new tmp();

    return resFn;
}

```

## 函数防抖

```js

function debounce(func, wait) {
    let timer;
    return function () {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            func.apply(this, arguments)
        }, wait);
    }
}
```

## 函数节流

```js
function throttle(fn, wait) {
    let prev = new Date();
    return function () {
        const args = arguments;
        const now = new Date();
        if (now - prev > wait) {
            fn.apply(this, args);
            prev = new Date();
        }
    }
}
```

## 实现一个 instanceOf

```js
Function.prototype.MyInstanceOf = function (lef, right) {
    let proto = lef.__proto__;
    let prototype = right.prototype
    while (true) {
        if (proto === null) return false
        if (proto === prototype) return true
        proto = proto.__proto__;
    }
}
```