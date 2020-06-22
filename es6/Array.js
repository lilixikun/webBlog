//扩展运算符
console.log(...[1, 2, 3]); //1 2 3
//用于函数调用
function push(arr, ...items) {
    arr.push(...items);
}

function add(x, y) {
    return x + y;
}
const nums = [2, 3];
add(...nums) //5

//替代函数 apply 方法
// 由于展开运算符可以展开数组,因此不需要apply方法将数组转成函数的参数

//es5方法
function f(x, y, z) {
    // ...
}
var args = [1, 2, 3];
f.apply(null, args);

//es6方法
function f(x, y, z) {
    //
}
f(...args);

//添加到数组末尾
//es5
var arr1 = [0, 1, 2];
var arr2 = [3, 4, 5];
Array.prototype.push.apply(arr1, arr2);

//es6
arr1.push(...arr2);

//扩展运算符还可以将字符串转为真正的数组
[...'hellow'] //[ "h", "e", "l", "l", "o" ]

//Array.from

//Array.from方法用于将两类对象转为真正的数组：
//类似数组的对象（array-like object）和可遍历（iterable）的对象（包括 ES6 新增的数据结构 Set 和 Map）
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3
};

// ES5的写法
var arr1 = [].slice.call(arrayLike); // ['a', 'b', 'c']

// ES6的写法
let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']

//只要是部署了 Iterator 接口的数据结构，Array.from都能将其转为数组。

Array.from('hello')
// ['h', 'e', 'l', 'l', 'o']

let namesSet = new Set(['a', 'b'])
Array.from(namesSet) // ['a', 'b']

Array.of
// Array.of方法用于将一组值，转换为数组。

Array() // []
Array(3) // [, , ,]
Array(3, 11, 8) // [3, 11, 8]

Array.of() // []
Array.of(undefined) // [undefined]
Array.of(1) // [1]
Array.of(1, 2) // [1, 2]

//手动实现
function ArrayOf() {
    return [].slice.call(arguments);
}

//Array.fill 方法使用给定值，填充一个数组
['a', 'b', 'c'].fill(7)
// [7, 7, 7]

new Array(3).fill(7)
// [7, 7, 7]

//fill方法还可以接受第二个和第三个参数，用于指定填充的起始位置和结束位置
['a', 'b', 'c'].fill(7, 1, 2)
// ['a', 7, 'c']



//entries()，keys()和values()——用于遍历数组

const arr = ["a", "b"];
for (const key of arr.keys()) {
    console.log(key);
}

for (const value of arr.values()) {
    console.log(value);
}

for (const [index, item] of arr.entries()) {
    console.log(index + "==: " + item);
}

for (const iterator of arr) {
    console.log(iterator);
}

// 是否包含某个元素 返回true
Array.prototype.includes