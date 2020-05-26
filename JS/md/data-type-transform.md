# JS 数据类型之间的转换

## [ ]== ! [ ] 结果 

解析:

在 == 中,左右需要转换成数字然后进行比较

[] 转换成 **0**

![] 首先转换成 布尔值，由于[] 作为一个引用类型 转换为布尔值为 true, 因此 ![]为false. false转换为数字为 0 。

0 == 0 结果为 true

## JS中类型转换类型有哪几种

- 转换为数字
- 转换为布尔值
- 转换为字符串

转换规则
 

| 原始值 | 转换目标 | 结果 |
| ------ | ------ | ------ |
| number | 布尔值 | 除了 +0，-0，NaN 都是 **true** |
| string | 布尔值 | 除了空字符串都是 **true** |
| undefined,null | 布尔值 | **false** |
| 引用类型 | 布尔值 | **true** |
| number | 字符串 | NaN->'Nan' |
| Boolean 函数 Symbol | 字符串 | 'string' |
| 数组 | 字符串 | [1,2,3]=>"1,2,3" |
| 对象 | 字符串 | {}=>"[object Object]" |
|string | 数字 |'1'=>1,'ss'=>NaN |
| 数组 | 数字 | 空数组为0, 存在一个元素且为数字转数字,其他情况为 NaN |
| null | 数字 | 0|
| 除了数组的引用类型 |数字 | NaN|
|Symbol | 数字 |抛错    |

## == 和 === 区别

使用==时，不同类型的值也可以被看作相等

|类型(x) | 类型(y) | 结果 |
|-----|----|---|
|null | undefined | true |
|undefined | null | true |
|数 | 字符串 | x==toNumber(y) |
|字符串 ｜数 | toNumber(x)==y |
| 布尔值 | 任何类型 | toNumber(x)==y|
| 任何类型 | 布尔值 | x==toNumber(y)|
| 字符串或数 | 对象 | x == toPrimitive(y) |
| 对象 | 字符串或数 | toPrimitive(x) ==y |


如果 x 和 y 的类型相同，JavaScript 会用 equals 方法比较这两个值或对象。没有列在这个 表格中的其他情况都会返回 false。

toPrimitive 方法对不同类型返回的结果如下。

|值类型 | 结果 |
|--- | ---|
|对象 | 如果对象的 valueOf 方法的结果是原始值，返回原始值;如果对象的 toString 方法返回 原始值，就返回这个值;其他情况都返回一个错误|

来看一道题

```js
'tom'==true
```

- 首先，布尔值会被 toNumber 方法转成数，因此得到 packt == 1
- 其次，用 toNumber 转换字符串值。因为字符串包含字母，所以会被转成 NaN，表达式
就变成了 NaN == 1，结果就是 false。

```js
'tom'==false
```

同上也是false


再来几个比较特殊的
```js
null > 0? //=>false
null < 0? //=>false
null >= 0?  //=>true
null <= 0?  //=>true
null == false //false
null == 0 // false
undefined == 0  //false
undefined == false //false
```

- 首先null > 0; 和 null < 0; 的结果是将null转换为数字0来进行的比较判断
- 判断null >= 0；时是靠null < 0 为false来判断的，如果 null < 0为fasle，则null > 0为true,所以null >= 0为true
- null  <= 0；为true同理。

**注意**

**null** 和 **undefined** 在做相等判断时，不进行转型，所以null和0为不同类型数据，结果为false。

练习

```js

// 每个表达式是 true 还是 false 呢？为啥呢？

// 初阶
!{}
12 == '12'
'false' == false
null == undefined

// 高阶
[] == []
[] == false
[] === false
[45] == 45

// 终阶
[45] < [46] ?
[10] < [9] ?
{} == !{}
{} != {}
-0 === +0
NaN === NaN
NaN != NaN

// 转换条件 转换后类型 结果
[]+[] // String “”
[1,2]+[3,4] // String “1,23,4”
[]+{} // String “[object Object]”
[1,2] + {a:1} // String “1,2[object Object]”
{}+[] // Number 0
{}+[1] //Number 1
{a:1}+[1,2] // Number NaN
{a:1}+{b:2} // Chrome - String “[object Object][object Object]” (背后实现eval)
{a:1}+{b:2} // Firefox - Number NaN
true+true // Number 2
1+{a:1} // String “1[object Object]”
```