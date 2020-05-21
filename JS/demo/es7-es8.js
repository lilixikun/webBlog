// ES7

// includes 判断一个数组是否包含某个元素
// let arr = [1, 2, 3]

// console.log(arr.includes(1));

// ES7 之前 

// arr.indexOf(1) >= 0


// 指数**
// console.log(Math.pow(2, 3));
// console.log(2 ** 3);


// ES8

// async await

// Object.values() 返回 Object 自身所有属性的值

let obj = { name: 'tom', age: 22 }
console.log(Object.values(obj));  //["tom", 22]

// 不用Object.values实现
const values = Object.keys(obj).map(key => obj[key])


// Object.entries() 返回一个给定对象自身可枚举属性的键值对的数组

for (const [key, value] of Object.entries(obj)) {
    console.log(key, value);
}

Object.keys(obj).forEach(key => {
    console.log(`${key}:=${obj[key]}`)
})


// Object.getOwnPropertyDescriptors() 函数用来获取一个对象的所有自身属性的描述符,如果没有任何自身属性，则返回空对象。

console.log(Object.getOwnPropertyDescriptors(obj));

new SharedArrayBuffer(200)
