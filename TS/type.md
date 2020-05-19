## 布尔值
```ts
let isBoole: boolean = false;
```

## 数值
```ts
let num: number = 6;
// 二进制
let binaryLiteral: number = 0b1010;
// 八进制
let octalLiteral: number = 0o744;
let notANumber: number = NaN;
let infinityNumber: number = Infinity;
```

## 字符串
```ts
let myName: string = 'Tom'
// 模板字符串
let sentence: string = `Hello, my name is ${myName}`
```

## 空值
``` ts
function alertName(): void {
    alert('MyName is Tome')
}

// 声明一个 void 类型的变量没有什么用，因为你只能将它赋值为 undefined 和 null：
let unusable: void = undefined

```

## Null 和 Underfined
在 TypeScript 中，可以使用 null 和 undefined 来定义这两个原始数据类型：

```ts
let u:undefined = undefined
let n: null = null;
```

与 **void**的区别，**undefined** 和 **numm** 是所有类型的子类型。也就是说 **undefined** 类型的变量可以赋值给 **number** 类型的变量
```ts
let num: number = undefined;
let u: undefined;
let num: number = u;
```

而 **void** 类型的变量不能赋值给 **number** 类型的变量

```ts
let u: void;
let num: number = u;

// Type 'void' is not assignable to type 'number'.
```

## 任意值

任意值(Any)用来表示允许赋值为任意类型

### 什么是任意值类型
如果是一个普通类型,在赋值过程中改变类型是不允许的:

```ts
let num: string = 'tom';
num = 7;
// Type 'number' is not assignable to type 'string'.
```

但如果是 **any** 类型,则允许被赋值为任意类型

```ts
let num: any = 'tom';
num = 7;
```

### 任意值的属性和方法

在任意值上访问任何属性都是允许的：

```ts
let anyThing: any = 'hello';
console.log(anyThing.myName);
console.log(anyThing.myName.firstName);
```

也允许调用任何方法：

```ts
let anyThing: any = 'Tom';
anyThing.setName('Jerry');
anyThing.setName('Jerry').sayHello();
anyThing.myName.setFirstName('Cat');
```

**声明一个变量为任意值之后，对它的任何操作，返回的内容的类型都是任意值。**

### 未声明类型的变量

变量如果在声明的时候，未指定其类型，那么它会被识别为任意值类型：

```ts
let something;
// 等价于
let something:any
```

**如果定义的时候没有赋值，不管之后有没有赋值，都会被推断成 any 类型而完全不被类型检查：**


## 联合类型

联合类型 表示取值可以为多种类型中的一种。

🌰

```ts
let myFavoriteNumber: string | number;
myFavoriteNumber = 'seven';
myFavoriteNumber = 7;
```



## 数组的表示法

### 「类型 + 方括号」

最简单的方法是使用「类型 + 方括号」来表示数组：

```ts
let fibonacci: number[] = [1, 1, 2, 3, 5];
```

> 数组中不允许出现其他的类型

### 数组泛型

也可以使用数组泛型(Array Generic) Array<elemType> 来表示数组：

```ts
let fibonacci: Array<number> = [1, 1, 2, 3, 5];
```


## 元祖
数组合并了相同类型的对象，而元组（Tuple）合并了不同类型的对象。

定义一对值分别为 string 和 number 的元组：

```js
let tom: [string, number] = ['Tom', 25];
```


访问一个已知索引的元素时，会得到正确的类型：

```js
let tom: [string, number];
tom[0] = 'Tom';
tom[1] = 25;

tom[0].slice(1);
tom[1].toFixed(2);
```

## 枚举

枚举使用 **enum** 关键字来定义：

```ts
const enum Directions {
    Up,
    Down,
    Left,
    Right
}
```

手动赋值

```ts
const enum Type {
    Pc = 1,
    Mobile = 2,
    Web = 3
}
```