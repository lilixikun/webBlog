<!-- TOC -->

- [js浅拷贝和深拷贝<!-- TOC -->](#js浅拷贝和深拷贝---toc---)
    - [javaScript的变量类型](#javascript的变量类型)
        - [基本类型：](#基本类型)
        - [引用类型：](#引用类型)
    - [浅拷贝和深拷贝的区分](#浅拷贝和深拷贝的区分)
    - [浅拷贝](#浅拷贝)
        - [浅拷贝的实现](#浅拷贝的实现)
    - [深拷贝](#深拷贝)
        - [深拷贝实现](#深拷贝实现)
- [推荐阅读](#推荐阅读)
    - [变量、作用域、内存问题](#变量作用域内存问题)
    - [JavaScript 数据类型回顾](#javascript-数据类型回顾)

<!-- /TOC -->

## javaScript的变量类型

### 基本类型：
5种基本数据类型 **Undefined**、**Null**、**Boolean**、**Number** 和 **String**,变量是直接按值存放的，存放在**栈内存中**的简单数据段，可以直接访问。

### 引用类型：
存放在**堆内存**中的对象，变量保存的是一个指针,这个指针指向另一个位置。当需要访问引用类型（如**Object**，**Array**等）的值时，首先从栈中获得该对象的地址指针，然后再从堆内存中取得所需的数据。



>JavaScript存储对象都是存地址的,所以浅拷贝会导致 obj1 和obj2 指向同一块内存地址。改变了其中一方的内容,都是在原来的内存上做修改会导致拷贝对象和源对象都发生改变,而深拷贝是开辟一块新的内存地址,将原对象的各个属性逐个复制进去。对拷贝对象和源对象各自的操作互不影响。

## 浅拷贝和深拷贝的区分

深复制和浅复制只针对像 **Object**, **Array** 这样的复杂对象的。简单来说，浅复制只复制一层对象的属性，而深复制则递归复制了所有层级。

## 浅拷贝
复制一层对象的属性，并不包括对象里面的为引用类型的数据，当改变拷贝的对象里面的引用类型时，源对象也会改变。

因为浅复制只会将对象的各个属性进行依次复制，并不会进行递归复制，而 JavaScript 存储对象都是存地址的，所以浅复制会导致 obj1和 obj2 指向同一块内存地址


```js
var obj1 = { a: 1, b: 2, c: 3 };
var obj2 = obj1;
obj2.b = 5;
console.log(obj2); //{ a: 1, b: 5, c: 3 }
console.log(obj1); //{ a: 1, b: 5, c: 3 };

```
### 浅拷贝的实现

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


## 深拷贝

不仅将原对象的各个属性逐个复制出去，而且将原对象各个属性所包含的对象也依次采用深复制的方法递归复制到新对象上

### 深拷贝实现

- 递归拷贝


```js
var people = {
    name: 'xxx',
    friends: ['people1', 'people2', 'peopple3'],
    info: {
        name: '133xxxxxxxx',
        age: '18',
        sex: 'man'
    }
}
function deepCopy(initObj, c) {
    var obj = c || {};
    for (var i in initObj) {
        if (typeof initObj[i] === 'object') {
            obj[i] = (initObj[i].constructor === Array) ? [] : {};
            deepCopy(initObj[i], obj[i]);
        } else {
            obj[i] = initObj[i];
        }
    }
    return obj;
}
var person = deepCopy(people);
person.info.name = "tom";
console.log(person.info.name);  //tom
console.log(people.info.name);  //133xxxxxxxx
```

- **JSON** 

```js

var result = JSON.parse(JSON.stringify(people))

```

- **Object.assign()拷贝**
  
说实话这个东西我一直以为是浅拷贝,后面去查了一下才发现 它 是可以实现 深拷贝的.

>当对象中只有一级属性，没有二级属性的时候，此方法为深拷贝，但是对象中有对象的时候，此方法，在二级属性以后就是浅拷贝

```js
var obj = { a: 1, b: 2, c: 3 };
var depObj = Object.assign({}, obj);
depObj.b = 2000;
console.log(obj.b); //2
console.log(depObj.b);  //2000
```

- **Object.create()**

```js
function deepCopy(obj) {
    var copy = Object.create(Object.getPrototypeOf(obj));
    var propNames = Object.getOwnPropertyNames(obj);

    propNames.forEach(function (name) {
        var desc = Object.getOwnPropertyDescriptor(obj, name);
        Object.defineProperty(copy, name, desc);
    });

    return copy;
}

var obj1 = { a: 1, b: { bc: 50, dc: 100, be: { bea: 1 } } };
var obj2 = deepCopy(obj1);
obj1.a = 20;
console.log(obj1.a)
console.log(obj2.a)
```

- 第三方库 **jQuery.extend** 和 **lodash**

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