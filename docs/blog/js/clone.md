# 克隆

## 基本类型：
5种基本数据类型 **Undefined**、**Null**、**Boolean**、**Number** 和 **String**，变量是直接按值存放的，存放在**栈内存中**的简单数据段，可以直接访问。

## 引用类型：
存放在**堆内存**中的对象，变量保存的是一个指针,这个指针指向另一个位置。当需要访问引用类型（如**Object**，**Array**等）的值时，首先从栈中获得该对象的地址指针，然后再从堆内存中取得所需的数据。


>JavaScript存储对象都是存地址的,所以浅拷贝会导致 obj1 和obj2 指向同一块内存地址。改变了其中一方的内容,都是在原来的内存上做修改会导致拷贝对象和源对象都发生改变,而深拷贝是开辟一块新的内存地址,将原对象的各个属性逐个复制进去。对拷贝对象和源对象各自的操作互不影响。

## 浅拷贝和深拷贝的区分

深复制和浅复制只针对像 **Object**, **Array** 这样的复杂对象的。简单来说，浅复制只复制一层对象的属性，而深复制则递归复制了所有层级。

**浅拷贝**
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

> 当对象中只有一级属性，没有二级属性的时候，此方法为深拷贝，但是对象中有对象的时候，此方法，在二级属性以后就是浅拷贝


## 深拷贝实现
将一个对象从内存中完整的拷贝一份出来,从堆内存中开辟一个新的区域存放新对象,且修改新对象不会影响原对象

### **丐中丐(业务最实用)JSON** 

```js
let obj = {
    func: function () {
        alert(1)
    },
    obj: { a: 1 },
    obj1: { a: { b: 3 } },
    arr: [1, 2, 3],
    und: undefined,
    reg: /123/,
    date: new Date(0),
    NaN: NaN,
    infinity: Infinity,
    sym: Symbol(1),
    set: new Set([1, 2, 3]),
    map: new Map([['a', 1], ['b', 9]]),
}

Object.defineProperty(obj, 'innumerable', {
    enumerable: false,
    value: 'innumerable'
})
console.log('obj', obj);
var str = JSON.stringify(obj);
var obj1 = JSON.parse(str);
console.log('obj1', obj1);
```

通过 **JSON.stringify** 实现深拷贝 我们发现了以下几点

- 拷贝的对象的值中如果有 **undefine** 或者 **symbol** 则经过 **JSON.stringify()** 序列化后的 JSON 字符串的这个 **key** 会消失
  
- 无法拷贝不可枚举属性,无法拷贝对象的原型链

- 拷贝 **Date** , **Map** , **Set** 引用类型会变成字符串

- 拷贝贝 **RegExp** 引用类型会变成空对象

- 对象中含有 **NaN**、**Infinity** 和 **-Infinity**，则序列化的结果会变成 **null**

- 无法拷贝对象的循环应用 如 obj1

除了Object对象和数组其他基本都和原来的不一样，obj1的 **constructor** 是Obj(),而obj2的 **constructor** 指向了 **Object**()，而对于循环引用则是直接报错了


### 基础版本-递归

```js
function clone(target) {
    let cloneTarget = {};
    for (const key in target) {
        cloneTarget[key] = target[key]
    }
    return cloneTarget
}
```

### 基础版本-对象引用

```js
function clone(target) {
    if (typeof target === "object") {
        let cloneTarget = Array.isArray(target) ? [] : {};
        for (const key in target) {
            cloneTarget[key] = clone(target[key]);
        }
        return cloneTarget;
    } else {
        return target;
    }
}
```

### 解决循环引用

```js
//解决循环引用问题，我们可以额外开辟一个存储空间，
//来存储当前对象和拷贝对象的对应关系，当需要拷贝当前对象时，
//先去存储空间中找，有没有拷贝过这个对象，如果有的话直接返回，
//如果没有的话继续拷贝，这样就巧妙化解的循环引用的问题

function clone(target, map = new Map()) {
    if (typeof target === 'object' && target !== null) {
        let cloneTarget = Array.isArray(target) ? [] : {};
        if (map.get(target)) {
            return map.get(target)
        }
        map.set(target, cloneTarget);
        for (const key in target) {
            cloneTarget[key] = clone(target[key], map);
        }
        return cloneTarget;
    } else {
        return target
    }
}

const obj = {
  test: {
    a: 2
  },
  arr: [],
  fn: function() {
    console.log("clone function");
  }
};
//故意设置循环引用造成Maximum call stack size
// obj.obj = obj;
// console.log(obj);
// { test: { a: 2 }, arr: [], obj: [Circular] }
// Circular 循环引用
const obj2 = clone(obj);
obj2.test.a = "修改";
obj2.arr.push("修改数组");
console.log(obj2.test.a);
console.log(obj.test.a);
console.log(obj.arr);
console.log(obj2.arr);
```

### 优化
优化去掉 for in 和使用弱引用

```js
function forEach(array, iteratee) {
    let index = -1;
    const length = array.length;
    while (++index < length) {
        iteratee(array[index], index);
    }
    return array;
}

function clone(target, map = new WeakMap()) {
    if (typeof target === "object" && target !== null) {
        const isArray = Array.isArray(target);
        let cloneTarget = isArray ? [] : {};

        if (map.get(target)) {
            return target;
        }
        map.set(target, cloneTarget);

        const keys = isArray ? undefined : Object.keys(target);
        forEach(keys || target, (value, key) => {
            if (keys) {
                key = value;
            }
            cloneTarget[key] = clone(target[key], map);
        });

        return cloneTarget;
    } else {
        return target;
    }
}
```

### 神仙版

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


## 完整版
```js
// 手写克隆完整版本

const mapTag = '[object Map]';
const setTag = '[object Set]';
const arrayTag = '[object Array]';
const objectTag = '[object Object]';
const argsTag = '[object Arguments]';

const boolTag = '[object Boolean]';
const dateTag = '[object Date]';
const numberTag = '[object Number]';
const stringTag = '[object String]';
const symbolTag = '[object Symbol]';
const errorTag = '[object Error]';
const regexpTag = '[object RegExp]';
const funcTag = '[object Function]';

const deepTag = [mapTag, setTag, arrayTag, objectTag, argsTag];


function forEach(array, iteratee) {
    let index = -1;
    const length = array.length;
    while (++index < length) {
        iteratee(array[index], index);
    }
    return array;
}

function isObject(target) {
    const type = typeof target;
    return target !== null && (type === 'object' || type === 'function');
}

function getType(target) {
    return Object.prototype.toString.call(target);
}

function getInit(target) {
    const Ctor = target.constructor;
    return new Ctor();
}

function cloneSymbol(targe) {
    return Object(Symbol.prototype.valueOf.call(targe));
}

function cloneReg(targe) {
    const reFlags = /\w*$/;
    const result = new targe.constructor(targe.source, reFlags.exec(targe));
    result.lastIndex = targe.lastIndex;
    return result;
}

function cloneFunction(func) {
    const bodyReg = /(?<={)(.|\n)+(?=})/m;
    const paramReg = /(?<=\().+(?=\)\s+{)/;
    const funcString = func.toString();
    if (func.prototype) {
        const param = paramReg.exec(funcString);
        const body = bodyReg.exec(funcString);
        if (body) {
            if (param) {
                const paramArr = param[0].split(',');
                return new Function(...paramArr, body[0]);
            } else {
                return new Function(body[0]);
            }
        } else {
            return null;
        }
    } else {
        return eval(funcString);
    }
}

function cloneOtherType(targe, type) {
    const Ctor = targe.constructor;
    switch (type) {
        case boolTag:
        case numberTag:
        case stringTag:
        case errorTag:
        case dateTag:
            return new Ctor(targe);
        case regexpTag:
            return cloneReg(targe);
        case symbolTag:
            return cloneSymbol(targe);
        case funcTag:
            return cloneFunction(targe);
        default:
            return null;
    }
}

function clone(target, map = new WeakMap()) {

    // 克隆原始类型
    if (!isObject(target)) {
        return target;
    }

    // 初始化
    const type = getType(target);
    let cloneTarget;
    if (deepTag.includes(type)) {
        cloneTarget = getInit(target, type);
    } else {
        return cloneOtherType(target, type);
    }

    // 防止循环引用
    if (map.get(target)) {
        return map.get(target);
    }
    map.set(target, cloneTarget);

    // 克隆set
    if (type === setTag) {
        target.forEach(value => {
            cloneTarget.add(clone(value, map));
        });
        return cloneTarget;
    }

    // 克隆map
    if (type === mapTag) {
        target.forEach((value, key) => {
            cloneTarget.set(key, clone(value, map));
        });
        return cloneTarget;
    }

    // 克隆对象和数组
    const keys = type === arrayTag ? undefined : Object.keys(target);
    forEach(keys || target, (value, key) => {
        if (keys) {
            key = value;
        }
        cloneTarget[key] = clone(target[key], map);
    });

    return cloneTarget;
}
```


## 第三方库
可以借助 **jQuery.extend** 和 **lodash** 来帮我们简单实现 深克隆

```js
$.extend( true, object1, object2 ); // 深度拷贝
$.extend( object1, object2 );  // 浅拷贝

_.cloneDeep(obj)
```

