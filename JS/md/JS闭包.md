# 闭包实质
当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前词法作用 域之外执行。


# 词法作用域

词法作用域根据源代码中声明变量的位置来确定该变量在何处可用。嵌套函数可访问声明于它们外部作用域的变量。


```js
function init() {
    var name = "Mozilla"; // name 是一个被 init 创建的局部变量
    function displayName() { // displayName() 是内部函数，一个闭包
        alert(name); // 使用了父函数中声明的变量
    }
    displayName();
}
init();
```

**displayName() 没有自己的局部变量。然而，因为它可以访问到外部函数的变量，所以 displayName() 可以使用父函数 init() 中声明的变量 name** 


```js

function makeFunc() {
    var name = "Mozilla";
    function displayName() {
        alert(name);
    }
    return displayName;
}

var myFunc = makeFunc();
myFunc();
```
**displayName 的实例维持了一个对它的词法环境（变量 name 存在于其中）的引用。因此，当 myFunc 被调用时，变量 name 仍然可用，其值 Mozilla 就被传递到alert中。**


# 闭包的作用

闭包很有用，因为它允许将函数与其所操作的某些数据（环境）关联起来。这显然类似于面向对象编程。在面向对象编程中，对象允许我们将某些数据（对象的属性）与一个或者多个方法相关联。


## 通常你使用只有一个方法的对象的地方，都可以使用闭包。

```js
function makeSizer(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

var size12 = makeSizer(12);
var size14 = makeSizer(14);
var size16 = makeSizer(16);
```

## 用闭包模拟私有方法

JavaScript 没有这种将方法申明为私有的原生支持，但我们可以使用闭包来模拟私有方法。私有方法不仅仅有利于限制对代码的访问：还提供了管理全局命名空间的强大能力，避免非核心的方法弄乱了代码的公共接口部分。

```js
var makeCounter = function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  }  
};

var Counter1 = makeCounter();
var Counter2 = makeCounter();
console.log(Counter1.value()); /* logs 0 */
Counter1.increment();
Counter1.increment();
console.log(Counter1.value()); /* logs 2 */
Counter1.decrement();
console.log(Counter1.value()); /* logs 1 */
console.log(Counter2.value()); /* logs 0 */
```

请注意两个计数器 Counter1 和 Counter2 是如何维护它们各自的独立性的。每个闭包都是引用自己词法作用域内的变量 privateCounter 。

每次调用其中一个计数器时，通过改变这个变量的值，会改变这个闭包的词法环境。然而在一个闭包内对变量的修改，不会影响到另外一个闭包中的变量。

> 以这种方式使用闭包，提供了许多与面向对象编程相关的好处 —— 特别是数据隐藏和封装

```js
function test() {
  var apple = 'yideng';
  return function () {
    debugger;
    window.eval('');
  };
}
```

# 练习

```js
function fun(n,o){
    console.log(o);
    return {
        fun:function(m){//[2]
            return fun(m,n);//[1]
        }
    }
}

var a=fun(0);
a.fun(1);
a.fun(2);
a.fun(3);
var b=fun(0).fun(1).fun(2).fun(3);
var c=fun(0).fun(1);
c.fun(2);
c.fun(3);
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


```js
// 循环打印
for (var i = 0; i < 3; i++) {
    setTimeout(function () {
        console.log(i);
    }, 1000)
}

//立即执行函数 
for (var i = 0; i < 3; i++) {
    (function (num) {
        setTimeout(function () {
            console.log(num);
        }, 1000);
    })(i);
}// 0// 1// 2


//返回一个匿名函数赋值
var data = [];
for (var i = 0; i < 3; i++) {
    data[i] = (function (num) {
        return function () {
            console.log(num);
        }
    })(i);
}

for (let i = 0; i < data.length; i++) {
    data[i]();
}
```

```js
// 获取多个元素并添加点击事件
// 找出所有P 打印对应的索引
var op = document.querySelectorAll("p");
for (var j = 0; j < op.length; j++) {
    op[j].onclick = function () {
        console.log(j);
    };
}

//解决1
for (let i = 0; i < op.length; i++) {
    op[i].onclick = (function (num) {
        return function () {
            console.log(num);
        }
    })(i)
}

for (let i = 0; i < op.length; i++) {
    (function (j) {
        op[j].onclick = function () {
            console.log(j);
        };
    })(i)
}
```

# 解析

```js
// 写出输出值

// 答案与解析
// return返回的对象的fun属性对应一个新建的函数对象，这个函数对象将形成一个闭包作用域，使其能够访问外层函数的变量n及外层函数fun,为了不将fun函数和fun属性搞混，我们将上述代码修改如下:
function _fun_(n,o){
    console.log(o);
    return {
        fun:function(m){
            return _fun_(m,n);
        }
    }
}
var a=_fun_(0);//undefined  // 调用最外层的函数，只传入了n,所以打印o是undefined
a.fun(1);//0  //因为外层函数的返回值是一个对象，这里通过对象调用方法，并传入一个实参1，此时m=1,然后返回值继续调用外层函数fun,并将m、n的值1，0作为形参传入即fun(1,0),此时n=1,o=0,打印o的值，所以打印0
a.fun(2);//0  // 同上
a.fun(3);//0 // 同上

/*
	_fun_(0), 调用最外层函数，并且传入一个参数0，进入函数代码块，首先用var 声明两个形参，此时第一个参数n=0,第二个参数o没有赋值，所以打印unfined
	fun(1), 因为fun(0)的返回值是一个对象，这里通过对象调用方法，并传入一个实参1，此时m=1,然后返回值继续调用外层函数fun,并将m、n的值1，0作为形参传入即fun(1,0),此时n=1,o=0,打印o的值，所以打印0
	fun(2), 因为fun(1)的返回值是一个对象，这里通过对象调用方法，并传入一个实参2，此时m=2,然后返回值继续调用外层函数fun,并将m、n的值2，1作为形参传入即fun(2,1),此时n=2,o=1,打印o的值，所以打印1
	fun(3) 同上
*/
var b=_fun_(0).fun(1).fun(2).fun(3);
//undefined,0,1,2

// 同上
var c=_fun_(0).fun(1);//undefined,0,
c.fun(2);//1
c.fun(3); //1
```

-[demo](https://github.com/LiLixikun/webBlog/blob/master/JS/demo/bibao.html)