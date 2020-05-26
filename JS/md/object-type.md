 # 引用类型
 
引用类型的值(对象)是**引用类型**的一个实例。**引用类型**是一种数据结构,用于将数据和功能组织在一起. 引用类型有时候也被成为**对象定义**

## Object 类型
创建**Object**实例有两种方法,第一种是使用**new**操作符后跟**Object**构造函数;

```js
var person = new Object();  //也可以写成 person = {}
person.name='xxx';
person.age=28;
```

另一种使用方式使用**对象字面量**表示法

```js
var person = {
    name : 'xxx',
    age : 28
}
```

一般来说,访问对象属性时使用的都是**点**表示法,不过在 JS 也可以使用方括号表示法来访问对象的属性 .

```js
alert(person["name"]); //"xxx"
alert(person.age); // 28
```

方括号语法的只要有点是可以通过变量来访问属性。通常除非必须使用变量来访问属性,否则我们使用**点表示法**,如下情况:

```js
person["first name"] = "xxx"
```

## Array 类型

创建数组的基本方式有两种,使用 Array 构造器

```js
var arr = new Array();
```

如果预先知道数组要保存的数量,可以给构造函数传递该数量,而该数量会自动变成 **length** 属性的值:

```js
var arr = new Array(10);
```

也可以向 **Array** 构造函数传递数组中包含的项

```js
var arr = new Array(20,'xx','name');
```

> 另外,在使用 Array 构造函数时可以省略 **new** 操作符

也可以使用数组字面量表示法:

```js
var arr = ['red','blue']; //创建一个包含2个字符串的数值
var arr1 = []; //创建一个空数组
var arr2 = [,,,,,] //不要这样 会创建一个包含5或者6项的数组
```

像这种省略值的情况下,每一项都将获得 **undefine** 值


数组的项数保存在其 **length** 属性中, length 并不是可读的,通过设置这个属性,可以从数组末尾移除项或向数组添加新项

```js
var colors = ['red','blue','green'];
colors.length=2;
alert(color[2]); //undefine
colors[colors.length]="black";
alert(colors[2]) //black
```

### 检测数组

对于一个网页或者一个全局作用域,使用 **instanceof** 操作符就能检测:

```js
if (value instanceof Array)
```

在ECMAScript5新值 **Array.isArray()** 方法,不管它在哪个全局执行环境中:

```js
if (Array.isArray(value))
```

### 转换方法

如前所述,所有对象都有 **toLocalString()**, **toString()**, **valueOf()** 方法,调用toString()方法会返回由数组中的每个值的字符串形式拼接而成的一个以 **逗号** 分割的字符串, 而 
valueOf() 返回的还是数组 .

```js
var colors = ['red','blue','green'];
alert(colors.toString()); //red,blue,green
alert(colors.valueOf()); //[red,blue,green]
```

数组继承的**toLocalString()**, **toString()**,**valueOf()**方法,在默认情况下会以**逗号**分割的字符串的形式返回数组项. 如果使用 **join()** 方法,接受一个参数,用作分隔符的字符串,然后返回包含所有数组项的字符串 .

```js
var colors = ['red','blue','green'];
alert(colors.join("||")) // rend||blue||green
```

### 栈方法

栈是一种 **LIFO** 的数据结构,也就是最新添加的项最早被移除. 而栈中项的**插入**(**推入**) 和 **移除**(**弹出**),只发生在一个位置 - 栈的顶部。 数组提供了 **push()** 和 **pop()** 方法

**push** 方法可以接收任意数量的参数,把它们添加到数组末尾,并返回修改后数组的长度. 而 **pop()** 方法则从数组尾部移除最后一项,减少数组的length,并返回移除的项。

```js
var colors = new Array();
var count = colors.push('red', 'green');
console.log(count); //2

var item = colors.pop();
console.log(item);; //green
console.log(colors.length); //1
```

### 队列方法

队列数据结构的访问规则是FIFO(先进先出). 队列在列表的 **末端** 添加项,从列表的 **前端** 移除项.

数组提供了 **shift()** 和 **unshift()** 方法.

- **shift()** 能够移除数组中的第一项并返回该项,同时将数组长度减 1 。

- **unshift()** 能在数组前端添加任意个项并返回数组的长度

```js
var colors = new Array();
var count = colors.unshift('red', 'green');
console.log(count); //2

var item = colors.shift();
console.log(item); //red
console.log(colors); //['green']
```

### 重排序方法

数组中的重排序方法: **reverse()** 和 **sort()** 

- **reverse**

reverse() 方法用于颠倒数组中元素的顺序,该方法会改变原来的数组，而不会创建新的数组。

```js
var arr = [1, 2, 3, 4, 5];
arr.reverse();
console.log(arr); //[5, 4, 3, 2, 1]
```

- **sort**

在默认情况下,**sort()** 方法按升序排列数组项 - 即最小的值位于最前面,最大值排在最后面. 为了实现排序, sort() 方法会调用每个数组项的 **toString()** 转型方法,然后比较得到的字符串.  即使数组中的每一个项都是数值, sort() 方法比较的还是字符串 

```js
    var values = [0, 1, 5, 10, 15];
    values.sort();
    console.log(values);  //[0, 1, 10, 15, 5]
```
看到这个结果我不淡定了,尼玛跟我想象的完全不一样啊。 结果查阅发现 字符串 对比为 **ASCII码比较** ,依次取每个字符，字符转为 **ASCII码**进行比较，ASCII码先大的即为大；因为第一个字符**5**比**1**大所以后面就不用考虑了

这种排序方式肯定不是最佳方案, 因此 **sort()** 方法可以接收一个比较函数作为参数, 

> 比较函数接收两个参数

- 如果第一个参数应该位于第二个之前则返回一个负数

- 如果两个参数相等则返回0

- 如果第一个参数位于第二个参数之后则返回一个整数

升序

```js
function compare(value1, value2) {
   return value1 - value2
}

var values = [0, 1, 5, 10, 15];
values.sort(compare);
console.log(values); //[0, 1, 5, 10, 15]

```

降序

```js
function compare(value1, value2) {
    return value2 - value1
}

var values = [0, 1, 5, 10, 15];
values.sort(compare);
console.log(values); // [15, 10, 5, 1, 0]

```

### 操作方法

**concat() 方法基于当前数组中的所有项创建一个新数组**

```js
var colors = ["red", "green", "blue"];
var colors1 = colors.concat("blcak", ["yellow", "brow"])
console.log(colors); //["red", "green", "blue"]
console.log(colors1); //["red", "green", "blue", "blcak", "yellow", "brow"]
```

**slice(),它能够基于当前数组中的一或对个项创建一个新数组**

<font color="#ff502c">arrayObject.slice(start,end)</font>

**slice()** 方法可以接收一或两个参数,即要返回项的起始和结束位置.

参数 | 描述
--- |---
start | 必需,只有一个参数的情况下, slice() 方法返回从该参数指定位置开始到数组末尾所有的项.如果是负数，那么它规定从数组尾部开始算起的位置。也就是说，-1 指最后一个元素，-2 指倒数第二个元素
end  | 可选,该方法返回起始和结束位置之间的项 - 但不包括结束位置的项。如果是负数，那么它规定从数组尾部开始算起的位置。也就是说，-1 指最后一个元素，-2 指倒数第二个元素


一个参数
```js
var arr = [0,1,2,3,4,5,6,7]
console.log(arr.slice(2)); // [2,3,4,5,6,7]
```

两个参数

```js
var arr = [0,1,2,3,4,5,6,7]
console.log(arr.slice(2，7)); // [2,3,4,5,6]
```

>如果slice()方法参数中有一个负数,则用数组长度加上该数来确定相应的位置

```js
var arr = [0,1,2,3,4,5,6,7]
console.log(arr.slice(-6,-1)); // [2,3,4,5,6]
```

**注释** 方法不会影响原始数组


**splice() 方法向/从数组中添加/删除项目，然后返回被删除的项目**

<font color="#ff502c">arrayObject.splice(index,howmany,item1,.....,itemX)
</font>


参数 | 描述
index | 必须。整数规定添加/删除项目的位置，使用负数可从数组结尾处规定位置。
howmany | 必需。要删除的项目数量。如果设置为 0，则不会删除项目。
item1, ..., itemX 可选。向数组添加的新项目。


> splice() 方法始终返回一个数组,该数组中包含从原数组中删除的项,如果没有返回一个空数组

**注释** 该方法会改变原始数组。

**说明**

splice() 方法可删除从 index 处开始的零个或多个元素，并且用参数列表中声明的一个或多个值来替换那些被删除的元素。

如果从 arrayObject 中删除了元素，则返回的是含有被删除的元素的数组。

### 位置方法

**indexOf()** 和 **lastIndexOf()**

这两个方法都接收两个参数:要查找的项 和 表示查找起点位置的索引。其中 indexOf() 方法从数组的开头向后查找,lastIndexOf() 方法则从数组的末尾开始向前查找

这两个方法都返回要查找的项在数组中的位置,在没有找到的情况下返回 **-1**

>在比较第一个参数和数组中的每一项时,会使用全等操作符 "==="

```js

var num = [1, 2, 3, 4, 5, 4, 3, 2, 1];
console.log(num.indexOf(4)); //3
console.log(num.lastIndexOf(4));  //5
console.log(num.indexOf(4, 4)); //5
console.log(num.lastIndexOf(4, 4)); //3
console.log(num.indexOf("4")); //-1

```

### 迭代方法

ECMAScript5 为数组定义了五个迭代方法.每个方法都接收两个参数:要在每一项运行的函数和运行该函数的作用域对象--影响**this**的值(可选)

**every**

对数组中的每一项运行给定函数,如果该函数对每一项都返回 **true**,则返回 **true**

```js

var numbers = [45, 4, 9, 16, 25];

var allOver18 = numbers.every((value)=>{
    return value > 18
});

console.log(allOver18); //false

```


**filter**

对数组中的每一项运行给定函数,返回该函数为 **true** 的项组成的数组

```js

var numbers = [45, 4, 9, 16, 25];

var numbers1 = numbers.filter((value) => {
    return value > 25
})
```


**forEach**

对数组中的每一项运行给定函数。这个方法没有返回值,和for 循环迭代数组一样

```js

var txt = "";
var numbers = [45, 4, 9, 16, 25];

numbers.forEach((value, index, arr) => {
    txt = txt + value + "<br>";
});

```

**map**

对数组中的每一项运行给定函数,返回每次函数调用的结果组成的数组

- map() 方法通过对每个数组元素执行函数来创建新数组。

- map() 方法不会对没有值的数组元素执行函数。

- map() 方法不会更改原始数组。

```js

var numbers = [45, 4, 9, 16, 25];

var numbers2 = numbers.map((value) => {
    return value * 2
})

```


**some**

对数组中的每一项运行给定函数,如果该函数对任一项都返回 **true**,则返回 **true**

```js

var numbers = [45, 4, 9, 16, 25];

var allOver18 = numbers.every((value)=>{
    return value > 18
});

console.log(allOver18); //true

```

**find**

返回通过测试函数的第一个数组元素的值。否则返回 undefined

```js

var numbers = [4, 9, 16, 25, 29];
var first = numbers.find((value)=>value > 18);

console.log(first); //25

```

**findIndex**

返回通过测试函数的第一个数组元素的索引。否则返回 **-1**

```js

var numbers = [4, 9, 16, 25, 29];
var first = numbers.findIndex((value)=>value > 18);

console.log(first); //3

```



### 归并方法

**reduce** 和 **reductRight**

这两个方法都会迭代数组的所有项,然后构建一个最终返回的值。**reduce** 方法从数组的第一项开放,逐个遍历到最后,和 **reductRight** 则相反

这两个方法都接收两个参数:一个在每一项上调用的函数和(可选的) 作为归并基数的初始值.

```js
var num = [1, 2, 3, 4, 5, 4, 3, 2, 1];
var sum = num.reduce(function (num1, num2, index, arr) {
    return num1 + num2;
})

console.log(sum); //25

var sum1 = num.reduceRight(function (num1, num2, index, arr) {
    return num1 + num2
})

console.log(sum1); //25

var sum2 = num.reduce(function (num1, num2, index, arr) {
    return num1 + num2
}, 10);
console.log(sum2); //35
```

## Date 类型

创建一个日期对象,使用 **new** 操作符和 **Date** 构造函数即可

```js

var now = new Date(); //Sat Dec 28 2019 16:52:15 GMT+0800 (中国标准时间)
```

如果想根据特定的日期和时间创建日期对象,必须传入表示日期的毫秒数。为了简化这一计算，ECMAScript 提供了两个方法 ：**Date.parse()** 和 **Date.UTC()**

```js
console.log(Date.parse("2019-12-28"));  //1577491200000
```
两个方法都接收一个表示日期的毫秒数，然后尝试根据这个字符串返回相应日期的毫秒数，如果传入的字符串不能表示日期，那么它会返回NaN。

```js

var time0 = 1560525082000;                 // Fri Jun 14 2019 23:11:22的毫秒数
var time1 = Date.UTC("Jun 14, 2004");          // 1560525082000
var time2 = Date.parse("Jun 14, 2004");    // 获取1087142400000
var time3 = "2019-06-14 23:11:22";
 var time4 = Date.parse("Junfdd"); //NaN

new Date(time0);    // Fri Jun 14 2019 23:11:22 GMT+0800 (中国标准时间)
new Date(time1);    // Fri Jun 14 2019 23:11:22 GMT+0800 (中国标准时间)
new Date(time2);    // Fri Jun 14 2019 23:11:22 GMT+0800 (中国标准时间)
new Date(time3);    // Fri Jun 14 2019 23:11:22 GMT+0800 (中国标准时间)，后台调用Date.parse(time3)转化为毫秒
```

## 日期的运算

类型自动转换时, **Date** 实例如果转为数值,则等于对应的 **毫秒数** ;如果转为字符串,则等于对应的 **日期字符串**

- 两个日期实例对象进行减法运算时,返回的是它们间隔的毫秒数

- 进行加法运算时,返回的是两个字符串链接而成的新字符串

```js

var d1 = new Date(2019, 12, 18);
var d2 = new Date(2019, 11.12);
console.log(d1 - d2); //4147200000
console.log(d1 + d2); //Sat Jan 18 2020 00:00:00 GMT+0800 (中国标准时间)Sun Dec 01 2019 00:00:00 GMT+0800 (中国标准时间)
```


## 静态方法 **Date.now()**

**Date.now()** 方法返回当前时间距离时间零点（1970年1月1日 00:00:00 UTC）的毫秒数，相当于 **Unix** 时间戳乘以 **1000**

```js

console.log(Date.now());

```

## 日期格式化方法

```js


var time = new Date();

console.log(time.toDateString()); //Sat Dec 28 2019
// "Tue Jun 18 2019"
console.log(time.toTimeString()); //17:05:37 GMT+0800 (中国标准时间)

console.log(time.toLocaleDateString());  //2019/12/28

console.log(time.toLocaleTimeString()); //下午5:05:58

console.log(time.toUTCString()); //Sat, 28 Dec 2019 09:06:12 GMT

console.log(time.toGMTString()); //Sat, 28 Dec 2019 09:06:24 GMT
```

## 日期/时间组件方法

**Date** 对象提供了一系列 **get** 方法，用来获取实例对象某个方面的值。

| 方法名          | 作用   | 
| --------       | :-----  | 
| getTime()      | getTime() 方法返回自 1970 年 1 月 1 日以来的毫秒数  |  
| getFullYear()  | getFullYear() 方法以四位数字形式返回日期年份   | 
| getMonth()     | getMonth() 以数字（0-11）返回日期的月份    | 
| getDate()      | getDate() 方法以数字（1-31）返回日期的日  |
| getHours()     | getHours() 方法以数字（0-23）返回日期的小时数  |
| getMinutes()   | getMinutes() 方法以数字（0-59）返回日期的分钟数  |
| getSeconds()   | getSeconds() 方法以数字（0-59）返回日期的秒数  |
| getMilliseconds()   | getMilliseconds() 方法以数字（0-999）返回日期的毫秒数 |
| getDay()       | getDay() 方法以数字（0-6）返回日期的星期名（weekday） |



**Date** 对象提供了一系列 **set** 方法，用来设置实例对象的各个方面

| 方法名          | 作用   | 
| --------       | :-----  | 
| setTime()      | setTime() 通过指定从 1970-1-1 00:00:00 UTC 开始经过的毫秒数来设置日期对象的时间，对于早于 1970-1-1 00:00:00 UTC的时间可使用负值。  |  
| setFullYear()  | setFullYear() 方法设置日期对象的年份  |  
| setMonth()     | setMonth() 方法设置日期对象的月份（0-11）  | 
| setDate()      | setDate() 方法设置日期对象的日（1-31）    | 
| setHours()     | setHours() 方法设置日期对象的小时（0-23）  |
| setMinutes()   | setMinutes() 方法设置日期对象的分钟（0-59）  |
| setSeconds()   | setSeconds() 方法设置日期对象的秒数（0-59）  |
| setMilliseconds()   | setMilliseconds() 方法设置日期对象的秒数（0-999）  |

## 将日期转换为指定的格式

```js

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份 
        "d+": this.getDate(),                    //日 
        "h+": this.getHours(),                   //小时 
        "m+": this.getMinutes(),                 //分 
        "s+": this.getSeconds(),                 //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds()             //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

var time = new Date().format("yyyy-MM-dd hh:mm:ss");
console.log(time);  
```

# RegExp 类型

**RegExp** 构造函数创建了一个正则表达式对象，用于将文本与一个模式匹配。


新建正则表达式有两种方法，一种是使用字面量，以斜杠表示开始和结束。

```js

var regex = /xyz/; //推荐
```

另一种是使用RegExp构造函数

```js

var regex = new RegExp("xyz");
```

参数 
1. 正则表达式的文本。

2. flags 如果指定，标志可以具有以下值的任意组合

   - g 全局匹配;找到所有匹配，而不是在第一个匹配后停止
   - i 忽略大小写
   - m 多行; 将开始和结束字符（^和$）视为在多行上工作（也就是，分别匹配每一行的开始和结束（由 \n 或 \r 分割），而不只是只匹配整个输入字符串的最开始和最末尾处。
   - u Unicode; 将模式视为Unicode序列点的序列
   - 粘性匹配; 仅匹配目标字符串中此正则表达式的lastIndex属性指示的索引(并且不尝试从任何后续的索引匹配)。
   - dotAll模式，匹配任何字符（包括终止符 '\n'）。

## 实例方法

**RegExp.prototype.exec()**
在目标字符串中执行一次正则匹配操作。如果发现匹配，就返回一个数组，成员是匹配成功的子字符串，否则返回null。

```js

var s = "_x_x";
var r1 = /x/;
var r2 = /y/;

r1.exec(s); // ["x"]
r2.exec(s); // null
```

**RegExp.prototype.test()**

正则实例对象的test方法返回一个布尔值，表示当前模式是否能匹配参数字符串。

```js

/cat/.test("cats and dogs"); // true
```

## 正则表达式中特殊字符的含义

详见 [RegExp -JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp#character-classes)

# Function 类型

在JavaScript中函数的创建方式有三种：函数声明（静态的）、函数表达式（函数字面量）、函数构造法（动态的，匿名的）

函数声明:

```js
function sum(num1,num2){
    return num1 + num2;
}
```

函数表达式的形式如下：

```js
var fun = function(){
    doSomething();
}
```

函数构造法构造函数的形式如下：

```js
var fun = new Function("para1","para2",...,"function body");    
```
>函数实际上是对象,每个函数都是Function类型的实例,而且都和其他引用类型一样具有属性和方法,函数名实际上也是指向 **函数指针** 的对象,不会与某个函数绑定.

## 没有重载

函数(或对象方法)完全靠函数名称唯一确定，JS不将参数列表作为区分函数的依据。更关键的是，在JS中，函数是作为一种特殊对象类型存在的，函数的名字只是一个普通的变量，本质与var a = 1中的变量a没什么区别。所以如果你先后定义了两个同名函数，实际上相当于先后将两个函数对象绑定到了同一个变量上，所以后者必然覆盖前者，不会共存，也自然不存在重载了。

## 函数声明和函数表达式区别

解析器在率先读取函数声音,并使其在执行任何代码之前可用;至于函数表达式,则必须等到解析器执行到它所在的代码行,才会真正被解释执行

```js

alert(sum(10,10));
function sum(num1,num2){
    return num1+num2;
}

```

如上过程在代码执行开始之前,解析器就通过一个名为 **函数声明提升** 的过程,读取并将函数声明标价到执行环境中.


## 作为值返回
 函数名本身就是变量,所以函数也可以作为值来返回。

## 函数内部属性

在函数内部,有两个特殊的对象: **argumens** 和 **this**

argumens 的主要用途是保存函数参数, this 引用的是函数执行的环境对象。 当在全局作用域调用函数时, **this** 引用的是 全局对象 **window**

>arguments有callee 属性,该属性是一个指针,指向拥有这个 arguments 对象的函数

```JS

function sum(num){
    if(num<=1){
        return 1;
    }else{
        return num * arguments.callee(num-1);
    }
}

alert(sum(5))
```

## 函数属性和方法

每个函数都包含两个属性: **length** 和 **prototype**

length 表示 希望接收的命名参数的个数, 没有命名参数,则为0

对于引用类型而言,**prototype** 是保存它们所有实例方法的真正所在. 在 ECMAScript5 中,prototype 属性是不可枚举的,因此使用 **for-in** 无法发现

### apply() 和 call() 

这两个方法的用途都是在特定的作用域中调用函数,实际上等于设置 函数体内 **this** 对象的值

**apply()**

 接收两个参数:一个是在其中运行函数的作用域,另一个是参数 数组,也可以是 **Array** 实例

```js

function sum20(num1, num2) {
    return num1 + num2;
}

function callSum1(num1, num2) {
    return sum20.apply(this, arguments);
}

function callSum2(num1, num2) {
    return sum20.apply(this, [num1, num2])
}

console.log(callSum1(10, 10));
console.log(callSum2(10, 10));

```

**call()**
  
call() 方法与 apply() 作用相同,区别在于接收参数不同,第一个参数 this 值没有变化,其余参数都是直接传递给函数

```js
function sum(num1, num2) {
    return num1 + num2;
}

function callSum(num1,num2){
    return sum.call(this,num1,num2);
}

```

>apply() 和 call() 真正强大的地方是能够扩充函数赖以运行的作用域,借用其他对象的方法。也就是说可以实现继承

**bind()**


bind() 方法会创建一个新函数，当这个新函数被调用时，它的 this 值是传递给 bind() 的第一个参数, 它的参数是 bind() 的其他参数和其原本的参数

由于bind返回的仍然是一个函数，所以我们还可以在调用的时候再进行传参。

```js

var name = "小张", age = 18;
var db = {
    name: "德玛",
    age: 99
};
var obj = {
    name: "小刘",
    objAge: this.age,
    myFun: function () {
        console.log(this.name + "年纪:" + this.age);
    }
}

obj.myFun();
obj.myFun.call();
obj.myFun.call(db);
obj.myFun.apply(db);
obj.myFun.bind(db)(); //返回一个新函数 必须执行才调用

```



# 基本包装类型

为了便于操作基本类型的值, ECMAScript 提供了三个特殊的引用类型 : **Boolean**、**Number** 和 **String** 

每当读取一个基本类型的时候,后台就会创建一个对应的基本类型的对象,从而让我们能够调用一些方法来操作这些数据, 如下:

```js

var s1 = "some text";
var s2 = s1.substring(2);
```

在访问 s1 时,访问模式处于一种读取模式,也就是要从内存中读取字符串的值。在读取模式中访问字符串时,后台会自动完成以下处理:

1. 创建 String 类型的一个实例:
2. 在实例上调用指定的方法:
3. 销毁这个实例

三个步骤执行如下:

```js

var s1 = "some text";
var s2 = s1.substring(2);
s1 = null;

```

>引用类型与基本包装类型的主要区别就是对象的生存期


使用 **new** 操作符创建的引用类型的实例,在执行流离开当前作用域之前一直保存在内存中。而自动创建的基本包装类型的对象,则只存在一行代码的执行瞬间,然后立即被销毁。**这也意味着我们不能在运行时为基本类型添加属性和方法** ：

```js

var s1 = "some text";
s1.color = "red";
alert(s1.color); //undefine

```

>对基本包装类型的实例调用 **typeof** 会返回 **object** , 所有基本包装类型的对象在转换为布尔值时值都是 **true**

```js

var num = "25" ;
var num1 = Number(num);

alert(typeof num); //string
alert(typeof num1); //number

var num2 = new Number(num);
alert(typeof num2); //object

```


## Boolean 类型

Boolean 类型是与布尔值对应的引用类型。要创建 Boolean 对象，可以像下面这样调用 Boolean构造函数并传入 true 或 false 值

```js

var booleanObject = new Boolean(true);
```

Boolean 类型的实例重写了valueOf()方法，返回基本类型值true 或false；重写了toString()方法，返回字符串"true"和"false"。可是，Boolean 对象在 ECMAScript 中的用处不大，因为它经常会造成人们的误解。其中最常见的问题就是在布尔表达式中使用 Boolean 对象，例如：

```js

var falseObject = new Boolean(false); 
var result = falseObject && true; 
alert(result); //true 

var falseValue = false; 
result = falseValue && true; 
alert(result); //false

```

下面结果没什么好说的，上面的为 **true**  是因为 布尔表达式中的所有对象都会被转换为 true，因此 falseObject 对象在布尔表达式中代表的是 true。结果，true && true 当然就等于 true 了

基本类型和引用类型的布尔值区别

- typeof 操作符对基本类型回"boolean"，而对引用类型返回"object"。
  
- 由于 Boolean 对象是 Boolean 类型的实例，所以使用 instanceof操作符测试 Boolean 对象会返回 true，而测试基本类型的布尔值则返回 false。

```js

var falseObject = new Boolean(false);
var falseValue = true;
alert(typeof falseObject); //object 
alert(typeof falseValue); //boolean 
alert(falseObject instanceof Boolean); //true 
alert(falseValue instanceof Boolean); //false
```


## Number 类型

Number 是与数字值对应的引用类型。要创建 Number 对象，可以在调用 Number 构造函数时向其中传递相应的数值。


```js

var numberObject = new Number(10);
```


Number类型重写了valueOf、toLocaleString()和toString()方法。valueOf()方法返回对象表示的进本类型的数值。另外两个方法返回字符串形式的数值。

### 属性

- Number.MAX_VALUE         
  
- Number.MIN_VALUE  

- Number.NAN 

- Number.prototype

### 原型中方法

**toFixed()**

参数:可选的,小数点后出现的位数.[0-20]之间的值,如果省略则视其为0

返回值: 按指定的小数位返回的数值的字符串


```js

var num=1234.678;
num.toFixed();  //Returns '1234'
num.toFixed(1); //Returns '1234.7'
num.tofiexd(3); //Reutrns '1234.678'

```

**toExponential()**

参数:可选的。一个整数，指定小数点后的位数。默认为指定数字所需要的位数

返回值:以指数表示法表示给定对象的字符串。

```js

var num=77.123
console.log(num.toExponential());   //7.7123e+1
console.log(num.toExponential(3));  //7.712

```

**toPrecision()**

参数:可选的。一个整数，指定有效为数。

返回值:表示数值定点或指数表示法对象的字符串

```js

var num = 5.123456;
console.log(num.toPrecision());     //'5.123456'
console.log(num.toPrecision(1));     //'5'
console.log(num.toPrecision(5));     //'5.1235'
console.log(0.01.toPrecision(2));     // '0.010'

```
## String 类型

String 类型是字符串的对象包装类型，可以像下面这样使用 String 构造函数来创建

```js

var stringObject = new String("hello world");
```

String 对象的方法也可以在所有基本的字符串值中访问到。其中，继承valueOf()、toLocaleString()和 toString()方法，都返回对象所表示的基本字符串值

String 类型的每个实例都有一个 **length** 属性，表示字符串中包含多个字符

```js

var stringValue = "hello world"; 
alert(stringValue.length); //"11"
```

### 字符方法

**charAt()**

以单字符串的形式返回给定位置的那个字符,如果超出索引则返回空串

参数:一个介于0 小于字符串长度的整数,没有提供默认 **0**

返回值:以单字符串的形式返回给定位置的那个字符串

```js

var strValue = "hello word";

console.log(strValue.charAt());//h
console.log(strValue.charAt(3)); // l
console.log(strValue.charAt(10)); // 空
```

**charCodeAt()**

该方法返回给定索引处字符的UTF-16代码的单元值的数字,如果超出范围返回NaN

参数: 大于或等于0且小于字符串长度的整数; 如果它不是数字，则默认为0

返回值: 表示给定索引处字符的 **UTF-16** 代码单元值的数字,如果超出索引返回 **NaN**

```js
var strValue = "hello word";

console.log(strValue.charCodeAt()); //104
console.log(strValue.charCodeAt(3)); //108
console.log(strValue.charCodeAt(10)); //NaN
```

### 字符串操作方法

**concat()**

用于将一或多个字符串拼接起来，返回拼接得到的新字符串

```js
var stringValue = "hello "; 
var result = stringValue.concat("world"); 

alert(result); //"hello world" 
alert(stringValue); //"hello"
```

>虽然 concat()是专门用来拼接字符串的方法，但实践中使用更多的还是加号操作符（+）。而且，使用加号操作符在大多数情况下都比使用concat()方法要简便易行（特别是在拼接多个字符串的情况下）

**slice()**

提取一个字符串区域，返回一个新的字符串。

参数 :
- 第一个参数,开始索引位置，如果为负数会被当做(字符串长度+开始值)

-  第二个参数,可选。从该索引处结束提取字符串(但不包括该索引值)。如果为负数会被当做(字符串长度+开始值)

返回值  : 返回一个从原字符串中提取出来的新字符串

```js

var s = "hello world";
console.log(s.slice(0, 3)); //'hel'
console.log(s.slice(3, 0)); //''
console.log(s.slice(-1, 3));//''
console.log(s.slice(3, 3)); //''
console.log(s.slice(3, -3)); //'lo wo'
```
**subString()**

该方法返回一个字符串从指定位置开始到指定字符数的字符。

参数 : 
- 第一个参数,一个0到字符串长度之间的整数。

- 第二个参数,可选，一个0到字符串长度之间的整数

> 如果第一个参数大于二个参数,则执行效果就像两个参数调换一样。如果参数中任意一个为负数则当在0来处理

返回值 ：提取第一个参数到第二个参数(不包括)之间的字符、

```js

var s = "hello world";

console.log(s.substring(0, 7)); //'hello w'
console.log(s.substring(3, 0)); //'hel'
console.log(s.substring(-1, 4));//'hell'
console.log(s.substring(2, 8)); //'llo wo'
```

**substr()**

该方法返回一个字符串从指定位置开始到指定字符数的字符。

参数:
- 第一个参数,开始提取字符的位置。如果是负值则被看作(strLength+start),其中strLength为字符串的长度


- 第二个参数,可选,提取的字符数。如果为0或负数则返回空串。

返回值 ：返回提取的字符串

```js

var s = "hello world";
console.log(s.substr(0, 3)); //'hel'
console.log(s.substr(3, 0)); //''
console.log(s.substr(-1, 3));//'d'
console.log(s.substr(3, 3)); //'lo '
console.log(s.substr(3, -3)); //''
```

### 字符串位置方法


从字符串中查找子字符串的方法：indexOf()和 lastIndexOf()

这两个方法的区别在于：indexOf()方法从字符串的开头向后搜索子字符串，而 lastIndexOf()方法是从字符串的末尾向前搜索子字符串

**indexOf()**

返回第一次出现的指定值的调用对象内的索引，如果未找到返回 **-1**

参数 :

- 表示要搜索值的字符串

- 表示从字符串的那个位置开始搜索,默认 **0**

返回值: 
- 返回 子字符串的第一次出现的索引值,没有找到返回 **-1** 

- 空字符串返回0到开始搜索索引的(该值大于0小于str.length)

```js

var str = 'hello world';
console.log(str.indexOf('hello'));     //0
console.log(str.indexOf('l'));        //2
console.log("".indexOf('l', 3));        //-1
console.log(str.indexOf(''));        //0
console.log(str.indexOf('', 4));        //4
console.log(str.indexOf('', 12));    //11 str.length
```


**lastIndexOf()**

返回指定值的最后一次出现的调用对象内的索引，如果未找到返回 **-1**

参数:
- 表示要搜索的值的字符串

- 第二个参数可选,表示字符串中从指定位置向前搜索

返回值:从后往前搜索字符串出现的索引值,未找到 **-1**

```js

var strValue = "helloxx oel";

console.log(strValue.lastIndexOf('o')); //8
console.log(strValue.lastIndexOf('o', 7)); //4
console.log(strValue.lastIndexOf('o', 2)); //-1
```

### trim()方法

这个方法创建一个字符串的副本,删除前置及后缀的所有空格,然后返回结果。不影响原字符串。

```js

var stringValue = " hello world "; 
var trimmedStringValue = stringValue.trim(); 

alert(stringValue); //" hello world " 
alert(trimmedStringValue); //"hello world"
```

### 字符串大小写转换方法

**toLocaleLowerCase()** 和 **toLocaleUpperCase()** 针对特定地区的实现

**toLowerCase()**

返回调用字符串值转换为小写。该方法不会影响原值

**toUpperCase()**

返回调用字符串值转换为大写。该方法不会影响原值

```JS

var stringValue = "hello world"; 

alert(stringValue.toUpperCase()); //"HELLO WORLD" 
alert(stringValue.toLowerCase()); //"hello world"
```

### 字符串的模式匹配方法

**math()** 方法

match()函数用于使用指定的正则表达式模式在当前字符串中进行匹配查找，并返回数组形式的查找结果。

参数 :包含正则表达式模式的RegExp对象的实例。也可以是包含正则表达式模式的变量名或字符串

> 如果参数regExp不是正则表达式对象(RegExp)，而是字符串类型，则match()先将该字符串传递给RegExp的构造函数，将其转换为一个RegExp对象

返回值 ：match()方法的返回值为Array类型，其返回数组的成员取决于指定的正则表达式模式是否设有全局标志g。

如果参数regExp没有全局标志g，则match()函数只查找第一个匹配，并返回包含查找结果的数组，该数组对象包含如下成员

- 索引0：存放第一个匹配的子字符串。
- 属性index：匹配文本在字符串中的起始索引位置。
- 属性input：整个字符串对象(stringObject)。

```js

var str = 'hello world';
var match = str.match('l');
console.log(match); //["l", index: 2, input: "hello world", groups:undefined] 
```

如果参数regExp设有全局标志g，则match()函数会查找所有的匹配，返回的数组不再有index和input属性

```js
var strValue = "helloxx oel";

console.log(strValue.match(/el/g)); //["el", "el"]

```

match()函数如果没有查找到任何匹配，则返回null

```js
var str = 'hello world';
console.log(str.match(/ain/g)); //null
```

**search**

参数: **search()** 方法的参数和 **match()** 方法的参数相同

返回值: 返回字符串中第一个匹配项的索引，如果没有找到返回 **-1**

```js
var str = 'hello world';
console.log(str.search('o')); //4
console.log(str.search('y'));  //-1
```

**replace**

该方法返回一个由替换值替换一些或所有匹配的模式后代的新字符串。模式可以是字符串或者一个正则表达式。

参数:

-  第一个参数，为模式或者一个要被替换的字符串
-  第二个参数,替换第一个参数的字符串。或者是一个而创建新字符串的函数

返回值: 一部分或全部匹配由代替模式所取代的新字符串

```js

var re = /cc/ig;
var str = "my name is cc,cc is my name";
str.replace(re, "wgs");
console.log(str); //"my name is wgs,wgs is my name"
console.log(str.replace("cc", "wgs"));//"my name is wgs,cc is my name"
```

**split**

该方法基于指定的分隔符将一个字符串分隔成多个子 字符串,并将结果放在一个数组中.

参数:
- 分隔符:可以是字符串，也可以是 **RegExp** 对象

- 用于指定数组的大小

```js

var s = "tody is good day";
sonsole.log(s.split(" "));// ["tody", "is", "good", "day"]
sonsole.log(s.split(" ", 2));// ["tody", "is"]
```

**includes**

includes() 方法用于判断字符串是否包含指定的子字符串。

如果找到匹配的字符串则返回 **true**，否则返回 **false**。

```js

var str = "Hello world, welcome to the Runoob。";
console.log(str.includes("world")) //true
```

### localeCompare方法 

这个方法比较两个字符串，并返回下列值中的一个：

- 如果字符串在字母表中应该排在字符串参数之前，则返回一个负数（大多数情况下是-1，具体的值要视实现而定

- 如果字符串等于字符串参数，则返回 0

- 如果字符串在字母表中应该排在字符串参数之后，则返回一个正数（大多数情况下是 1，具体的值同样要视实现而定）

```js

var stringValue = "yellow";
console.log(stringValue.localeCompare("brick")); //1 
console.log(stringValue.localeCompare("yellow")); //0 
console.log(stringValue.localeCompare("zoo")); //-1
```

### fromCharCode 方法

这个方法的任务是接收一或多个字符编码，然后将它们转换成一个字符串。

```js

alert(String.fromCharCode(104, 101, 108, 108, 111)); //"hello"
```

### repeat

repeat() 方法字符串复制指定次数。

```js

var str1 = "Runoob";
console.log(str1.repeat(2));//RunoobRunoob
```

