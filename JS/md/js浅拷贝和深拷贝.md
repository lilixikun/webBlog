<!-- TOC -->

- [javaScript的变量类型<!-- TOC -->](#javascript的变量类型---toc---)
    - [基本类型：](#基本类型)
    - [引用类型：](#引用类型)
- [浅拷贝和深拷贝的区分](#浅拷贝和深拷贝的区分)
- [浅拷贝](#浅拷贝)
    - [浅拷贝的实现](#浅拷贝的实现)
- [深拷贝](#深拷贝)
    - [深拷贝实现](#深拷贝实现)
        - [**丐中丐(业务最实用)JSON**](#丐中丐业务最实用json)
        - [**Object.assign()拷贝**](#objectassign拷贝)
        - [**基础版本**-**递归**](#基础版本-递归)
        - [**完整版**](#完整版)
        - [第三方库 **jQuery.extend** 和 **lodash**](#第三方库-jqueryextend-和-lodash)
- [推荐阅读](#推荐阅读)
    - [变量、作用域、内存问题](#变量作用域内存问题)
    - [JavaScript 数据类型回顾](#javascript-数据类型回顾)

<!-- /TOC -->

## 基本类型：
5种基本数据类型 **Undefined**、**Null**、**Boolean**、**Number** 和 **String**,变量是直接按值存放的，存放在**栈内存中**的简单数据段，可以直接访问。

## 引用类型：
存放在**堆内存**中的对象，变量保存的是一个指针,这个指针指向另一个位置。当需要访问引用类型（如**Object**，**Array**等）的值时，首先从栈中获得该对象的地址指针，然后再从堆内存中取得所需的数据。



>JavaScript存储对象都是存地址的,所以浅拷贝会导致 obj1 和obj2 指向同一块内存地址。改变了其中一方的内容,都是在原来的内存上做修改会导致拷贝对象和源对象都发生改变,而深拷贝是开辟一块新的内存地址,将原对象的各个属性逐个复制进去。对拷贝对象和源对象各自的操作互不影响。

# 浅拷贝和深拷贝的区分

深复制和浅复制只针对像 **Object**, **Array** 这样的复杂对象的。简单来说，浅复制只复制一层对象的属性，而深复制则递归复制了所有层级。

# 浅拷贝
复制一层对象的属性，并不包括对象里面的为引用类型的数据，当改变拷贝的对象里面的引用类型时，源对象也会改变。

因为浅复制只会将对象的各个属性进行依次复制，并不会进行递归复制，而 JavaScript 存储对象都是存地址的，所以浅复制会导致 obj1和 obj2 指向同一块内存地址


```js
var obj1 = { a: 1, b: 2, c: 3 };
var obj2 = obj1;
obj2.b = 5;
console.log(obj2); //{ a: 1, b: 5, c: 3 }
console.log(obj1); //{ a: 1, b: 5, c: 3 };

```
## 浅拷贝的实现

- 简单的引用复制

```js

var obj1 = {
    a: 1,
    b: 2,
    c: 3,
    d: {
        a: "深层次",
        b: "name"
    }
};

function cloneObj(arg) {
    var obj = {};
    for (const key in arg) {
        obj[key] = arg[key]
    }
    return obj;
}

var obj2 = cloneObj(obj1);


obj2.a = 10;
obj2.d.b = "name11";
console.log(obj2.a);  //10
console.log(obj1.a);  //1
console.log(obj2.d.b); //name11
console.log(obj1.d.b); //name11
console.log(obj1.d.a === obj3.d.a); //true
```

- **Object.assign()**
  
```js

var obj3 = Object.assign({}, obj1);
console.log(obj3.a);  //1
console.log(obj3.d.b); //name11
```  


>浅拷贝就是拷贝了一层，除了对象是拷贝的引用类型，其他都是直接将值传递，有自己的内存空间的。


# 深拷贝

将一个对象从内存中完整的拷贝一份出来,从堆内存中开辟一个新的区域存放新对象,且修改新对象不会影响原对象


## 深拷贝实现

### **丐中丐(业务最实用)JSON** 

```js

function Obj() {
    this.func = function () {
        alert(1)
    };
    this.obj = { a: 1 };
    this.obj1 = { a: { b: 3 } };
    this.arr = [1, 2, 3];
    this.und = undefined;
    this.reg = /123/;
    this.date = new Date(0);
    this.NaN = NaN
    this.infinity = Infinity
    this.sym = Symbol(1)
    this.set = new Set([1, 2, 3])
    this.map = new Map([['a', 1], ['b', 9]])
}
var obj1 = new Obj();
Object.defineProperty(obj1, 'innumerable', {
    enumerable: false,
    value: 'innumerable'
})
console.log('obj1', obj1);
var str = JSON.stringify(obj1);
var obj2 = JSON.parse(str);
console.log('obj2', obj2);

```

打印出来的结果如下:

![jsonpare.png](https://user-gold-cdn.xitu.io/2020/1/9/16f89e9b0795e01a?w=1048&h=766&f=png&s=20099)

通过 **JSON.stringify** 实现深拷贝 我们发现了以下几点

- 拷贝的对象的值中如果有 **undefine** 或者 **symbol** 则经过 **JSON.stringify()** 序列化后的 JSON z字符串的这个 **key** 会消失
  
- 无法拷贝不可枚举属性,无法拷贝对象的原型链

- 拷贝 **Date** , **Map** , **Set** 引用类型会变成字符串

- 拷贝贝 **RegExp** 引用类型会变成空对象

- 对象中含有 **NaN**、**Infinity** 和 **-Infinity**，则序列化的结果会变成null

- 无法拷贝对象的循环应用 如 obj1

除了Object对象和数组其他基本都和原来的不一样，obj1的 **constructor** 是Obj(),而obj2的 **constructor** 指向了 **Object**()，而对于循环引用则是直接报错了



### **Object.assign()拷贝**
  
说实话这个东西我一直以为是浅拷贝,后面去查了一下才发现 它 是可以实现 深拷贝的.

>当对象中只有一级属性，没有二级属性的时候，此方法为深拷贝，但是对象中有对象的时候，此方法，在二级属性以后就是浅拷贝

```js
function Obj() {
    this.func = function () {
        alert(1)
    };
    this.obj = { a: 1 };
    // this.obj1 = { a: { b: 3 } };
    this.arr = [1, 2, 3];
    this.und = undefined;
    this.reg = /123/;
    this.date = new Date(0);
    this.NaN = NaN
    this.infinity = Infinity
    this.sym = Symbol(1)
    this.set = new Set([1, 2, 3])
    this.map = new Map([['a', 1], ['b', 9]])
}
var obj1 = new Obj();
var obj2 = Object.assign({}, obj1);
console.log(obj1);
console.log(obj2);
console.log(obj1 === obj2);
//一级属性
obj1.und = "xxxx"
console.log(obj1.und);
console.log(obj2.und);
//二级属性 出错
obj1.obj.a = "aaaaaaaaaaaa"
console.log(obj1.obj.a);
console.log(obj2.obj.a);
```


### **基础版本**-**递归**

```js
function deepCopy(obj) {
    if (typeof obj === "object") {
        if (obj.constructor === Array) {
            var newArr = []
            for (var i = 0; i < obj.length; i++) newArr.push(obj[i])
            return newArr
        } else {
            var newObj = {}
            for (var key in obj) {
                newObj[key] = this.deepCopy(obj[key])
            }
            return newObj
        }
    } else {
        return obj
    }
}

var obj1 = {
    a: {
        b: 2
    },
    b: 3
}
var obj2 = deepCopy(obj1)
obj1.a.b = "3333";
console.log(obj1);
console.log(obj2);
```

通过测试发现以下缺点

- deepClone函数并不能复制不可枚举的属性

- 只是针对Object引用类型的值做的循环迭代，而对于Array,Date,RegExp,Error,Function引用类型无法正确拷贝

- 对象循环引用

### **完整版**

```js

const isComplexDataType = obj => (typeof obj === 'object' || typeof obj === 'function') && (obj !== null)

const deepClone = function (obj, hash = new WeakMap()) {

    let type = [Date, RegExp, Set, Map, WeakMap, WeakSet]
    if (type.includes(obj.constructor)) return new obj.constructor(obj);

    //如果成环了,参数obj = obj.loop = 最初的obj 会在WeakMap中找到第一次放入的obj提前返回第一次放入WeakMap的cloneObj
    if (hash.has(obj)) return hash.get(obj)

    //遍历传入参数所有键的特性
    let allDesc = Object.getOwnPropertyDescriptors(obj);
    //继承原型
    let cloneObj = Object.create(Object.getPrototypeOf(obj), allDesc);
    hash.set(obj, cloneObj)

    //Reflect.ownKeys(obj)可以拷贝不可枚举属性和符号类型
    for (let key of Reflect.ownKeys(obj)) {
        // 如果值是引用类型(非函数)则递归调用deepClone
        cloneObj[key] = (isComplexDataType(obj[key]) && typeof obj[key] !== 'function') ? deepClone(obj[key], hash) : obj[key];
    }

    return cloneObj;

};
```

总结如下

- 利用Reflect.ownKeys()方法,能够遍历对象的不可枚举属性

- 参数为Date, RegExp, Set, Map, WeakMap, WeakSet类型则直接生成一个新的实例

- 用 **Object.getOwnPropertyDescriptors()** 获得对象的所有属性对应的特性,结合 **Object.create()** 创建一个新对象继承传入原对象的原型链

- 利用 **WeekMap**() 的键对自己所引用对象的引用都是弱引用，在没有其他引用和该键引用同一对象，这个对象将会被垃圾回收


### 第三方库 **jQuery.extend** 和 **lodash**

```js
$.extend( true, object1, object2 ); // 深度拷贝
$.extend( object1, object2 );  // 浅拷贝

_.cloneDeep(obj)
```


# 推荐阅读

## 变量、作用域、内存问题
- [变量、作用域、内存问题](https://juejin.im/post/5deef199f265da3398562333)

## JavaScript 数据类型回顾
- [JS数据类型](https://juejin.im/post/5deda003f265da33910a3325)