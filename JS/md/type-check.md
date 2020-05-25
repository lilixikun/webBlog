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
**优点** 能检测array,function,object类型 
**缺点** 检测不了number,boolean,string, 对 **Array** 进行检测 Array 和 Object Function 同样

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