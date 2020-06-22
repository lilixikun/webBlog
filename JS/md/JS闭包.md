# 闭包实质
当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用 域之外执行。

# 练习

```js
function fun(n, o) {
    console.log(o);
    return {
        fun: function (m) {
            return fun(m, n)
        }
    }
}
var a = fun(0)
a.fun(1); a.fun(2);
var b = fun(0).fun(1).fun(2).fun(3);
var c = fun(0).fun(1);
c.fun(2); c.fun(3)

function foo() {
    var a = 2;
    function bar() {
        console.log(a);
    }
    bar()
}
foo()
```

```js
var name = 'window'

function Person(name) {
    this.name = name;
    this.fn1 = function () {
        console.log(this.name);
    };
    this.fn2 = () => console.log(this.name);
    this.fn3 = function () {
        return function () {
            console.log(this.name)
        };
    };
    this.fn4 = function () {
        return () => console.log(this.name);
    };
};

var obj1 = new Person('听风是风');
console.dir(obj1);
var obj2 = new Person('行星飞行');

obj1.fn1();
obj1.fn1.call(obj2);

obj1.fn2();
obj1.fn2.call(obj2);

obj1.fn3()();//window
obj1.fn3().call(obj2);
obj1.fn3.call(obj2)();

obj1.fn4()();
obj1.fn4().call(obj2);
obj1.fn4.call(obj2)();
```