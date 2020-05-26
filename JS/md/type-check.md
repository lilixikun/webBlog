# typeof

```js
typeof 1 // number
typeof '1'  // string
typeof undefined // 'undefined'
typeof function(){} // function
typeof true // boolean
typeof {} // object
typeof null // object
typeof [] // object
typeof Symbol() // symbol
typeof 10n // bigint
```

<font color="#ff502c">优点：能快速检查undefined,string,number,boolean类型

缺点：当类型为object,null,array时都会返回object,所以不能区分这三类</font>


# instanceof

```js
1 instanceof Number // false
'str' instanceof String  // false
true instanceof Boolean  // false
[] instanceof Array   // true
{} instanceof Object // true
function(){} instanceof Function // true
[] instanceof Object // true
function(){} instanceof Object // true
```
<font color="#ff502c"> **优点** 能检测array,function,object类型 

**缺点** 检测不了number,boolean,string, 对 **Array** 进行检测为 Array 和 Object, Function 同样 </font>

## instanceof 为什么检测不了基本数据类型


instanceof 本意是用来判断 A 是否为 B 的实例对象，表达式为：A instanceof B，如果A是B的实例，则返回true,否则返回false。

```js
instanceof (A,B) = {
var L = A.__proto__;
var R = B.prototype;
if(L === R) {
//A的内部属性__proto__指向B的原型对象
return true;
}
return false;
}
```
上面的 str 只是一个以 **string** 为数据类型的值 并不是 **String** 的实例对象 ,'str' instanceof String 在只有左侧是右侧类的对象时才会度返回ture

说明 'str' 本身并不是任何一个类的实例

如果想将这个数据类型转换为 String 的类对象的话可以如下:


```js
let str = new String('str')
str instanceof String  //true
```

其他基本类型如同


# object.prototype.toString.call()
```js
var typeCheck = Object.prototype.toString

typeCheck.call([]) //"[object Array]"

typeCheck.call({}) // "[object Object]"

typeCheck.call('str') // "[object String]"

typeCheck.call(11) // "[object Number]"

typeCheck.call(true) // "[object Boolean]"

typeCheck.call(undefined) // "[object Undefined]"

typeCheck.call(null) // "[object Null]"

```