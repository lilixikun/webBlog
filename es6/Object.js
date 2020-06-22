//方法简写
const o = {
    name: "张三",
    method() {
        //
        console.log(this.name);
    }
}
//等同于
const o1 = {
    name: "李四",
    method: function () {
        console.log(this.name);
    }
}

//注意简写的对象方法不能用作构造函数,会报错
new o.method(); //抛错

// es6 允许定义字面量对象时 表达式作为对象的属性,即把表达式放在 []内

let property = "fo";
let obj = {
    [property]: 123
}
console.log(obj); // {fo:123}
//属性名表达式与简洁表示法不能同时使用
obj = {
    [property]
}

//属性表达式如果是一个对象,会自动把对象转成字符串 "[object Object]"
const keyA = { a: 1 };
const keyB = { b: 2 };
let myObj = {
    [keyA]: "A",
    [keyB]: "B"
}
console.log(myObj); //{'[object Object]':'B}

//对象的每个属性都有一个描述对象,用来控制该属性的行为
let obf = { foo: 123 };
const desc = Object.getOwnPropertyDescriptor(obf, 'foo');
console.log(desc);
/**
 * value:123,
 * writable:true,
 * enumerable:true, 可枚举
 * configurable:true
 */

//目前有四个操作忽悠 enumerable 为false的属性

// for ...in  只遍历对象自身的和继承的可枚举的属性
// Object.keys() 返回对象自身的所有可枚举的属性的键名。
// JSON.stringify() 只串行化对象自身的可枚举的属性
// Object.assign() 忽略enumerable为false的属性，只拷贝对象自身的可枚举的属性。

// es6 一共有五种方法遍历属性的方法

// for in
// Object.keys()
// Object.getOwnPropertyNames  //返回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名。
// Object.getOwnPropertySymbols  返回一个数组，包含对象自身的所有 Symbol 属性的键名。

//返回一个数组，包含对象自身的所有键名，不管键名是 Symbol 或字符串，也不管是否可枚举
//Reflect.ownKeys  

let testObj = {
    name: "lili",
    age: 12
}
Object.defineProperties(testObj, {
    age: {
        value: 234,
        enumerable: false
    }
})
for (const key in testObj) {
    console.log(key);
}

// 对象的扩展运算符 ...
let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 3 };

//结构赋值要求右边是一个对象
let { ...z } = undefined || null; //语法错误

let x = { ...'hello' }; //{0: "h", 1: "e", 2: "l", 3: "l", 4: "o"}

//Null判断符
//当某个属性值为 Null 或者 undefined 指定默认值
//es5
const str = x.x || "23";
//es6
const str1 = x.x ?? "22";

// Object.is() 判断两个值是否严格相等
//两个不同之处
+0 === -0;//true
NaN === NaN;
Object.is(+0, -0);//false
Object.is(NaN, NaN)//true

//利用es5实现
Object.defineProperties(Object, "is", {
    value: function (x, y) {
        if (x === y) {
            return x !== 0 || 1 / x === 1 / y;
        }
        return x !== x && y !== y;
    },
    configurable: true,
    enumerable: false,
    writable: true
})

//Object.assign()
//用来处理数组会把数组视为对象
Object.assign([1, 2, 3], [4, 5]);//[4,5,3]
//Object.assign把数组视为属性名为 0、1、2 的对象，因此源数组的 0 号属性4覆盖了目标数组的 0 号属性1

//克隆
Object.assign({}, { a: 1 });
//采用这种方法克隆，只能克隆原始对象自身的值，不能克隆它继承的值。如果想要保持继承链，可以采用下面的代码。
function clone(obj) {
    let ownPro = Object.getPrototypeOf(obj);
    return Object.assign(Object.create(ownPro), obj);
}

/*
Object.keys();
Object.values();
Object.entries();
*/

let { keys, values, entries } = Object;
let obj = { a: 1, b: 2, c: 3 };

for (let key of keys(obj)) {
    console.log(key); // 'a', 'b', 'c'
}

for (let value of values(obj)) {
    console.log(value); // 1, 2, 3
}

for (let [key, value] of entries(obj)) {
    console.log([key, value]); // ['a', 1], ['b', 2], ['c', 3]
}
//手动实现entries
function* entries(obj) {
    for (const key of Object.keys(obj)) {
        yield [key, obj[key]]
    }
}

function entries(obj) {
    let arr = [];
    for (const key of Object.keys(obj)) {
        arr.push([key, obj[key]])
    }
    return arr;
}

//Object.fromEntries()方法是Object.entries()的逆操作，用于将一个键值对数组转为对象
Object.fromEntries([
    ['foo', 'bar'],
    ['baz', 42]
])
  // { foo: "bar", baz: 42 }



