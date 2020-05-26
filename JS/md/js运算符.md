# 汇总表

下面的表将所有运算符按照优先级的不同从高到低排列。



题目如下:

```js
function Foo() {
    getName = function () { alert (1); };
    return this;
}
Foo.getName = function () { alert (2);};
Foo.prototype.getName = function () { alert (3);};
var getName = function () { alert (4);};
function getName() { alert (5);}

//请写出以下输出结果：
Foo.getName();
getName();
Foo().getName();
getName();
new Foo.getName();
new Foo().getName();
new new Foo().getName();
```

题目二:

```js
var a = {n:1};
var b = a ;
a.x = a ={n:2}
```

写出 a,b,a.x 的值