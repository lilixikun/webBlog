//Iterator 的作用有三个：一是为各种数据结构，提供一个统一的、简便的访问接口；
//二是使得数据结构的成员能够按某种次序排列；
//三是 ES6 创造了一种新的遍历命令for...of循环，Iterator 接口主要供for...of消费。

function idMark() {
    var id = 0;
    return {
        next: function () {
            return { value: id++, done: false }
        }
    }
}

var it = idMark();
it.next().value; //2
it.next().value; //2

//如果使用 TypeScript 的写法，遍历器接口（Iterable）、指针对象（Iterator）和next方法返回值的规格可以描述如下。

const obj = {
    [Symbol.iterator]: function () {
        return {
            next: function () {
                return {
                    value: 1,
                    done: true
                }
            }
        }
    }
}

//元素具有 inerator 接口的数据结构如下

Array
Map
Set
String
TypedArray
//函数 arguments 对象
//NodeList 对象

//数组例子
const arr = ['a', 'b', 'c'];
const iter = arr[Symbol.iterator]();

console.log(iter.next()); //{ value:'a',done:false}

//实现给一个对象添加Iterator 方法

let obj = {
    data: [1, 2, 3],
    [Symbol.iterator]: function () {
        var index = 0;
        var selef = this;
        return {
            next: function () {
                if (index < self.data.length) {
                    return {
                        value: self.data[index++],
                        done: false
                    }
                } else {
                    return {
                        value: undefined,
                        done: true
                    }
                }
            }
        }
    }
}

//类数组的对象调用数组的
let inerator = {
    "0": "a",
    "1": "b",
    "2": "c",
    length: 3,
    [Symbol.iterator]: Array.prototype[Symbol.iterator]
}

for (const item of inerator) {
    console.log(item); // a b c
}

//调用iterator 接口场合
// 1. 结构赋值
// 2. 扩展运算符
var str = "hello"
let strs = [...str]
console.log(strs);//[ 'h', 'e', 'l', 'l', 'o' ]


// 3. yield *
function* generator() {
    yield 1;
    yield [2, 3.4];
}
var gen = generator();
gen.next();
gen.next();
gen.next();


//字符串的 iterator 
var str = new String("hi");
// [..str] ['h','i']
str[Symbol.iterator] = function () {
    return {
        done: true,
        next() {
            if (this.done) {
                return {
                    value: "sb",
                    done: false
                }
            } else {
                return {
                    done: true
                }
            }
        }
    }
}

//[...str] ['sb']
str //hi

let obj = {
    *[Symbol.iterator]() {
        yield 'hello'
        yield 'word'
    }
}
for (const item of obj) {
    console.log(item);
}

//for of 普通对象不能使用
/**
 * 有些数据结构是在现有数据结构的基础上，计算生成的。比如，ES6 的数组、Set、Map 都部署了以下三个方法，调用后都返回遍历器对象。

entries() 返回一个遍历器对象，用来遍历[键名, 键值]组成的数组。对于数组，键名就是索引值；对于 Set，键名与键值相同。Map 结构的 Iterator 接口，默认就是调用entries方法。
keys() 返回一个遍历器对象，用来遍历所有的键名。
values() 返回一个遍历器对象，用来遍历所有的键值。
这三个方法调用后生成的遍历器对象，所遍历的都是计算生成的数据结构
 */
let arr=['a','b','c'];
for (const iterator of arr.entries()) {
    console.log(iterator);
}