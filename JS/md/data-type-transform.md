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

**转换为原始类型**

对象在转换类型的时候，会执行原生方法 **ToPrimitive** 。

- 如果已经是 原始类型，则返回当前值
- 如果需要转 字符串 则先调用toSting方法，如果此时是 原始类型 则直接返回，否则再调用valueOf方法并返回结果
- 如果不是 字符串，则先调用valueOf方法，如果此时是 原始类型 则直接返回，否则再调用toString方法并返回结果
- 如果都没有 原始类型 返回，则抛出 TypeError 类型错误。

我们可以通过重写 **Symbol.toPrimitive** 来制定转换规则，此方法在转原始类型时调用优先级最高。


```js
const data = {
  valueOf() {
    return 1;
  },
  toString() {
    return "1";
  },
  [Symbol.toPrimitive]() {
    return 2;
  }
};
data + 1; // 3

```

## 转换为布尔值

|参数类型 | 结果 |
|---- | --- |
| Undefined | false |
|Null | false |
|Boolean | 返回当前 |
|Number|参数为+0、-0或NaN，则返回 false；其他情况则返回 true|
|String | 字符串为空返回 false, 否则返回 true
|Symbol|true|
|Object|true|

## 转换为数字
|参数类型 | 结果 |
|---- | --- |
| Undefined | NaN |
|Null | 0|
|Boolean | 参数为 true，则返回 1；false则返回 +0。|
|Number | 返回当前参数。|
|String | 先调用 ToPrimitive ，再调用 ToNumber ，然后返回结果|
|Symbol | 抛出 TypeError错误。|
|Object | 先调用 ToPrimitive ，再调用 ToNumber ，然后返回结果|


## 转换为字符串
|参数类型 | 结果 |
|---- | --- |
| Undefined | 'undefined' |
| Null | 'null' |
|Boolean | 参数为 true ,则返回 "true"；否则返回 "false"|
| Number | 调用 NumberToString ，然后返回结果。|
| String | 返回 当前参数。|
| Symbol | 抛出 TypeError错误。|\
| Object | 先调用 ToPrimitive ，再调用 ToString ，然后返回结果。 |

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