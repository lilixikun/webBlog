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
