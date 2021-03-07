# 前段模块化
在搞懂它们之前的区别,首先得理解 前段模块化. 模块化的开发方式可以提高代码复用率，方便进行代码的管理。通常一个文件就是一个模块，有自己的作用域，只向外暴露特定的变量和函数。

# CommonJS

Node.js是commonJS规范的主要实践者，它有四个重要的环境变量为模块化的实现提供支持：**module**,**exports**,**require**,**global**. 实际使用时,用 **module.exports**定义当前模块对外输出的接口（不推荐直接用exports）, 用 **require** 加载模块。

**CommonJS的特点**
- 所有代码都运行在模块作用域，不会污染全局作用域
- 模块是同步加载的，即只有加载完成，才能执行后面的操作
- 模块在首次执行后就会缓存，再次加载只返回缓存结果，如果想要再次执行，可清除缓存
- CommonJS输出是值的拷贝(即，require返回的值是被输出的值的拷贝，模块内部的变化也不会影响这个值)。

**ES6模块与 COmmonJS 模块的差异**

它们有两个重大差异。
- CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。

第二个差异是因为 CommonJS 加载的是一个对象(即module.exports属性),该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。

```js
// 定义模块math.js
var basicNum = 0;
function add(a, b) {
  return a + b;
}
module.exports = { //在这里写上需要向外暴露的函数、变量
  add: add,
  basicNum: basicNum
}

// 引用自定义的模块时，参数包含路径，可省略.js
var math = require('./math');
math.add(2, 5);
```

# AMD 和 require.js

**AMD** 规范采用异步方式加载模块,模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。

**require.js** 实现 AMD 规范的模块化：用 **define()**定义模块，用 **require()**加载模块。


```
//a.js
//define可以传入三个参数，分别是字符串-模块名、数组-依赖模块、函数-回调函数
define(function(){
    return 1;
})

// b.js
//数组中声明需要加载的模块，可以是模块名、js文件路径
require(['a'], function(a){
    console.log(a);// 1
});
```

**RequireJS的特点**
对于依赖的模块,AMD推崇依赖前置,提前执行. 也就是说,在 **define** 方法里传入的依赖模块(数组),会在一开始就下载并执行。


# CMD
CMD是SeaJS在推广过程中生产的对模块定义的规范,在Web浏览器端的模块加载器中,SeaJS与RequireJS并称,SeaJS作者为阿里的玉伯。



**使用 exports 暴露模块接口**

使用 sea.js 创建一个模块，文件名为：hangge.js

```
define(function(require, exports) {
    // 对外提供name属性
    exports.name = 'hangge';
    // 对外提供hello方法
    exports.hello = function() {
      console.log('Hello hangge.com');
    };
});
```

在 HTML 页面使用

```
<script type="text/javascript" src="sea.js"></script>
    <script type="text/javascript">
        //加载一个模块，在加载完成时，执行回调
        seajs.use('hangge', function(a) {
        a.hello();
    });
</script>
```

**SeaJS的特点**

对于依赖的模块, **CMD** 推崇依赖就近,延迟执行。也就是说,只有到require时依赖模块才执行。

# ES6 Module

其模块功能主要由两个命令构成：**export** 和 **import**。export命令用于规定模块的对外接口，import命令用于输入其他模块提供的功能

```
/** export default **/
//定义输出
export default { basicNum, add };
//引入
import math from './math';
function test(ele) {
    ele.textContent = math.add(99 + math.basicNum);
}

```

ES6的模块不是对象，import命令会被 JavaScript 引擎静态分析，在编译时就引入模块代码，而不是在代码运行时加载，所以无法实现条件加载。也正因为这个，使得静态分析成为可能。