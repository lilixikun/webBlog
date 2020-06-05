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
Function.prototype.mycall = function (thisArg) {
    if (typeof this !== "function") {
        throw new TypeError("error")
    }
    const arg = [...arguments].slice(1);
    // 声明一个 Symbol 属性，防止 fn 被占用
    const fn = Symbol("fn");
    thisArg = thisArg || window;
    //将调用 fn 添加到 thisArg 对象中
    thisArg[fn] = this;
    //执行函数
    const result = thisArg[fn](...arg)
    //删除属性
    delete thisArg[fn];
    return result;
}
```

## apply 实现

```js
Function.prototype.myapply = function (thisArg) {
    console.log(arguments);

    if (typeof this !== "function") {
        throw new TypeError("this no a function")
    }
    const arg = [...arguments].slice(1);
    const fn = Symbol("fn");
    thisArg[fn] = this;
    //执行函数
    const result = thisArg[fn](arg);
    delete thisArg[fn]
    return result;
}
```

## bind 实现

因为bind转换后的函数可以作为构造函数使用，此时this应该指向构造出的实例，而bind函数绑定的第一个参数。

```js
Function.prototype.mybind = function (thisArg) {
    if (typeof this !== "function") {
        throw new TypeError("Bind must be called on a function");
    }
    //保存原函数
    var self = this;
    // 拿到参数，为了传给调用者
    const args = Array.prototype.slice.call(arguments, 1),

        //构建一个新函数,保存原函数的原型
        nop = function () { },
        bound = function () {
            // this instanceof nop, 判断是否使用 new 来调用 bound
            // 如果是 new 来调用的话，this的指向就是其实例，
            // 如果不是 new 调用的话，就改变 this 指向到指定的对象 o
            return self.apply(
                this instanceof nop ? this : thisArg,
                args.concat(Array.prototype.slice.call(arguments))
            );
        };

    // 箭头函数没有 prototype，箭头函数this永远指向它所在的作用域
    if (this.prototype) {
        nop.prototype = this.prototype
    }

    //修改原型函数的绑定指向
    bound.prototype = new nop();
    return bound;
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