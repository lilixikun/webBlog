# this 到底是什么
this 是在运行时进行绑定的，并不是在编写时绑定，它的上下文取决于函数调 用时的各种条件。this 的绑定和函数声明的位置没有任何关系，只取决于函数的调用方式。

当一个函数被调用时，会创建一个活动记录（有时候也称为执行上下文）。这个记录会包 含函数在哪里被调用（调用栈）、函数的调用方法、传入的参数等信息。this 就是记录的 其中一个属性，会在函数执行的过程中用到。

## 调用位置
调用位置：调用位置就是函数在代码中被调用的 位置（而不是声明的位置）。

```js
function baz() {
    // 当前调用栈是：baz 
    // 因此，当前调用位置是全局作用域 
    console.log("baz");
    bar();  // <-- bar 的调用位置 

}
function bar() {

    // 当前调用栈是 baz -> bar 
    // 因此，当前调用位置在 baz 中 
    console.log("bar");
    foo(); // <-- foo 的调用位置 
}
function foo() {
    // 当前调用栈是 baz -> bar -> foo 
    // 因此，当前调用位置在 bar 中
    console.log("foo");
    baz(); // <-- baz 的调用位置
}
```
##  默认绑定
最常用的函数调用类型：独立函数调用。

```js
function foo() {
    console.log(this.a);
}
```

当调用 foo() 时，this.a 被解析成了全局变量 a。为什么？因为在本 例中，函数调用时应用了 this 的默认绑定，因此 this 指向全局对象。

## 隐式绑定
调用位置是否有上下文对象，或者说是否被某个对象拥有或者包 含，不过这种说法可能会造成一些误导。

```js
function foo() {
    console.log(this.a);
}
var obj = {
    a: 2,
    foo: foo
};
obj.foo(); //2
```

 foo() 被调用时，它的落脚点确实指向 obj 对象。当函数引 用有上下文对象时，隐式绑定规则会把函数调用中的 this 绑定到这个上下文对象。因为调 用 foo() 时 this 被绑定到 obj，因此 this.a 和 obj.a 是一样的。

 ## 隐式丢失

 一个最常见的 this 绑定问题就是被隐式绑定的函数会丢失绑定对象，也就是说它会应用默认绑定，从而把 this 绑定到全局对象或者 undefined 上，取决于是否是严格模式

 ```js
function foo() {
    console.log(this.a)
}
var obj = {
    a: 2,
    foo: foo
}

var bar = obj.foo;
var a = 'oops, global'; //a 是全局对象
bar() // oops, global
 ```

虽然 bar 是 obj.foo 的一个引用，但是实际上，它引用的是 foo 函数本身，因此此时的 bar() 其实是一个不带任何修饰的函数调用，因此应用了默认绑定。 

## 显示绑定

JavaScript 中的“所有”函数可以使用函数的 call(..) 和 apply(..) 方法。
这两个方法是如何工作的呢？它们的第一个参数是一个对象，它们会把这个对象绑定到 this，接着在调用函数时指定这个 this。因为你可以直接指定 this 的绑定对象，因此我 们称之为显式绑定。

```js
function foo() {
    console.log(this.a)
}

var obj = {
    a: 2
}

foo.call(obj) //2
```

## new 绑定

使用 new 来调用函数，或者说发生构造函数调用时，会自动执行下面的操作。

- 创建（或者说构造）一个全新的对象。
- 这个新对象会被执行 [[ 原型 ]] 连接。
- 这个新对象会绑定到函数调用的 this。
- 如果函数没有返回其他对象，那么 new 表达式中的函数调用会自动返回这个新对象。

```js
function foo(a) {
    this.a = a
}
var bar = new foo(2)
console.log(bar.a)
```

使用 new 来调用 foo(..) 时，我们会构造一个新对象并把它绑定到 foo(..) 调用中的 this 上。new 是最后一种可以影响函数调用时 this 绑定行为的方法，我们称之为 new 绑定。

# 判断 this

现在我们可以根据优先级来判断函数在某个调用位置应用的是哪条规则

- 函数是否在 new 中调用（new 绑定）？如果是的话 this 绑定的是新创建的对象
  var bar = new foo()
- 函数是否通过 call、apply（显式绑定）或者硬绑定调用？如果是的话，this 绑定的是 指定的对象。
  var bar = foo.call(obj2)
- 函数是否在某个上下文对象中调用（隐式绑定）？如果是的话，this 绑定的是那个上 下文对象。
  var bar = obj1.foo()
- 如果都不是的话，使用默认绑定。如果在严格模式下，就绑定到 undefined，否则绑定到 全局对象。  
  var bar = foo()

# 练习

## 题一

```js
var obj = {
    a: 1,
    foo: function (b) {
        b = b || this.a
        return function (c) {
            console.log(this.a + b + c)
        }
    }
}
var a = 2
var obj2 = { a: 3 }

obj.foo(a).call(obj2, 1)
obj.foo.call(obj2)(1)
```

## 题二

```js
var number = 5;
var obj = {
    number: 3,
    fn1: (function () {
        var number;
        this.number *= 2;
        number = number * 2;
        number = 3;
        return function () {
            var num = this.number;
            this.number *= 2;
            console.log(num);
            number *= 3;
            console.log(number);
        }
    })()
}
var fn1 = obj.fn1;
fn1.call(null);
obj.fn1();
console.log(window.number);

```

## 题三

```js
this.a = 20;
function go() {
    console.log(this.a);
    this.a = 30;
}
go.prototype.a = 40;
var test = {
    a: 50,
    init: function (fn) {
        fn();
        console.log(this.a);
        return fn;
    }
};
console.log((new go()).a);
test.init(go);
var p = test.init(go);
p();
```