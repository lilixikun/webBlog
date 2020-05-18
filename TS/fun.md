## 函数申明

两种常见的定义函数的方式——函数声明（Function Declaration）和函数表达式（Function Expression）

一个函数有输入和输出，要在 TypeScript 中对其进行约束，需要把输入和输出都考虑到，其中函数声明的类型定义较简单：

```ts
function sum(x: number, y: number): number {
    return x + y;
}
```
> 注意，输入多余的（或者少于要求的）参数，是不被允许的：

## 函数表达式

写一个对函数表达式（Function Expression）的定义，可能会写成这样：

```ts
let mySum = function (x: number, y: number): number {
    return x + y;
};
```

## 可选参数

与接口中的可选属性类似，我们用 ? 表示可选的参数：

```ts
function buildName(firstName: string, lastName?: string) {
   // do
}
let tomcat = buildName('Tom', 'Cat');
let tom = buildName('Tom');
```

> 需要注意的是，可选参数必须接在必需参数后面。换句话说，可选参数后面不允许再出现必需参数了：

## 默认参数

在 ES6 中，我们允许给函数的参数添加默认值，TypeScript 会将添加了默认值的参数识别为可选参数

```ts
function buildName(firstName: string, lastName: string = 'Cat') {
    return firstName + ' ' + lastName;
}
let tomcat = buildName('Tom', 'Cat');
let tom = buildName('Tom');
```

## 剩余参数

ES6 中，可以使用 ...rest 的方式获取函数中的剩余参数（rest 参数）：

```ts
function push(array: any[], ...items: any[]) {
    // do
}

let a = [];
push(a, 1, 2, 3);
```

## 重载

重载允许一个函数接受不同数量或类型的参数时，作出不同的处理。

```ts
// 上边是声明
function add(arg1: string, arg2: string): string
function add(arg1: number, arg2: number): number
// 因为我们在下边有具体函数的实现，所以这里并不需要添加 declare 关键字

// 下边是实现
function add(arg1: string | number, arg2: string | number) {
    // 在实现上我们要注意严格判断两个参数的类型是否相等，而不能简单的写一个 arg1 + arg2
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
        return arg1 + arg2
    } else if (typeof arg1 === 'number' && typeof arg2 === 'number') {
        return arg1 + arg2
    }
}
```