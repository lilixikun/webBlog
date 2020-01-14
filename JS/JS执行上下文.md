
# 执行顺序<!-- TOC -->

- [执行顺序](#执行顺序)
- [JS 执行上下文](#js-执行上下文)
    - [全局执行上下文](#全局执行上下文)
    - [函数执行上下文](#函数执行上下文)
        - [执行上下文栈(执行栈)](#执行上下文栈执行栈)
        - [执行上下文创建阶段](#执行上下文创建阶段)
            - [确定 **this**](#确定-this)
            - [词法环境](#词法环境)
            - [变量环境](#变量环境)
    - [总结](#总结)
    - [参考](#参考)

<!-- /TOC -->
S代码的执行顺序总是与代码先后顺序有所差异，当先抛开异步问题你会发现就算是同步代码，它的执行也与你的预期不一致，比如
```js
    function fun1() {
        console.log("执行");
    }

    fun1();
    function fun1() {
        console.log("再次执行");
    }
    fun1();
```

但是把  <font color="#ff502c"> 函数什么改成函数表达式</font> ,结果又不一样:

```js

    var fun2 = function () {
        console.log("执行");
    }
    fun2();

    var fun2 = function () {
        console.log("再次执行");
    }
    fun2();
```

如果看过上篇文章 [你不知道的JS 预编译]("https://juejin.im/post/5e1bc27d5188254c0a040d0e) 我们不难可以得到答案:

前者 在预编译时 在全局作用域生成 GO:
```js

GO{
    fun1:undefined==>fun
}
```
申明了两个相同的 **fun1** 以后面为主, 然后执行 <font color="#ff502c"> fun1 </font> , 再次遇到 fun1 申明直接忽略, 因为JS 预编译 已经申明过,因此 打印一样没问题.


后者如此, 生成全局作用域 GO:

```js

GO{
    fun1:undefined==>fun==>fun
}
```
后者因为是函数表达式 执行完 再次赋值,因而输出不同.

为什么看着差距不大的代码,结果却不同,在执行前发送了什么变化,JS 引擎做了什么？ 这不得不提 **JS执行上下文**

# JS 执行上下文

## 全局执行上下文

全局执行上下文只有一个, 在客户端中 一般 由 <font color="#ff502c"> 浏览器创建 </font>, 也就是 <font color="#ff502c"> window </font> 对象,我们也可以通过 <font color="#ff502c"> this </font> 直接访问它. 我们通过 **var** 创建的全局对象,也可以在 **window** 直接访问


![](https://upload-images.jianshu.io/upload_images/2919971-23383cfe118f0f97.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


## 函数执行上下文

每当一个函数被调用时都会创建一个函数上下文, <font color="#ff502c"> 同一个函数被多次调用，都会创建一个新的上下文 </font>

### 执行上下文栈(执行栈)
当在全局上下文中调用执行一个函数时，程序流就进入该被调用函数内，此时引擎就会为该函数创建一个新的执行上下文，并且将其压入到执行栈顶部（作用域链）。浏览器总是执行位于执行栈顶部的当前执行上下文，一旦执行完毕，该执行上下文就会从执行栈顶部弹出，并且控制权将进入其下的执行上下文。这样，执行栈中的执行上下文就会被依次执行并且弹出（Pop），直到回到全局的执行上下文
![](https://upload-images.jianshu.io/upload_images/2919971-4cac1ad1b783d34b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


### 执行上下文创建阶段

执行上下文创建分为 **创建阶段** 与 **执行阶段** 两个阶段

JS执行上下文的创建阶段主要负责三件事：<font color="#ff502c">确定this---创建词法环境（LexicalEnvironment）---创建变量环境（VariableEnvironment）</font>


创建过程如下:

```js

ExecutionContext = {  
    // 确定this的值
    ThisBinding = <this value>,
    // 创建词法环境
    LexicalEnvironment = {},
    // 创建变量环境
    VariableEnvironment = {},
};
```

#### 确定 **this**

官方的称呼为 <font color="#ff502c"> This Binding</font>,在全局执行上下文中，**this** 总是指向全局对象，例如浏览器环境下this指向window对象。而在 **nodejs** 中指向这个文件的 **module** 对象。

在函数执行上下文中，this的值取决于函数的调用方式，this 的值取决于函数的调用方式。具体有：默认绑定、隐式绑定、显式绑定（硬绑定）、new绑定、箭头函数
#### 词法环境

词法环境有两个组成部分

1. <font color="#ff502c">环境记录 </font> ：用于存储变量和函数声明的实际位置

2. <font color="#ff502c">对外部环境引入记录 </font> ：用于保存它可以访问的其它外部环境 (有点作用域链的意思)


前面提到全局执行上下文和函数执行上下文,所以导致了词法环境也分两种:

1. <font color="#ff502c">全局词法环境 </font> 

是一个没有外部环境的词法环境，其外部环境引用为 null。拥有一个全局对象（window 对象）及其关联的方法和属性（例如数组方法）以及任何用户自定义的全局变量，this 的值指向这个全局对象

1. <font color="#ff502c">函数词法环境 </font> 

用户在函数中定义的变量被存储在环境记录中，包含了arguments 对象。对外部环境的引用可以是全局环境，也可以是包含内部函数的外部函数环境。

```js

GlobalExectionContext = {  // 全局执行上下文
  LexicalEnvironment: {    	  // 词法环境
    EnvironmentRecord: {   		// 环境记录
      Type: "Object",      		   // 全局环境
      // 标识符绑定在这里 
      outer: <null>  	   		   // 对外部环境的引用
  }  
}

FunctionExectionContext = { // 函数执行上下文
  LexicalEnvironment: {  	  // 词法环境
    EnvironmentRecord: {  		// 环境记录
      Type: "Declarative",  	   // 函数环境
      // 标识符绑定在这里 			  // 对外部环境的引用
      outer: <Global or outer function environment reference>  
  }  
}
```

#### 变量环境

变量环境可以说也是词法环境，它具备词法环境所有属性，一样有环境记录与外部环境引入。

在ES6中唯一的区别在于 <font color="#ff502c">词法环境用于存储函数声明与let const声明的变量</font> ，而<font color="#ff502c">变量环境仅仅存储 var 声明的变量。</font> 

通过一串伪代码来理解它们：

```js

let a = 20;  
const b = 30;  
var c;

function multiply(e, f) {  
 var g = 20;  
 return e * f * g;  
}

c = multiply(20, 30);
```

执行上下文如下所示：

```js
GlobalExectionContext = {

  ThisBinding: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      a: < uninitialized >,  
      b: < uninitialized >,  
      multiply: < func >  
    }  
    outer: <null>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Object",  
      // 标识符绑定在这里  
      c: undefined,  
    }  
    outer: <null>  
  }  
}

FunctionExectionContext = {  
   
  ThisBinding: <Global Object>,

  LexicalEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      Arguments: {0: 20, 1: 30, length: 2},  
    },  
    outer: <GlobalLexicalEnvironment>  
  },

  VariableEnvironment: {  
    EnvironmentRecord: {  
      Type: "Declarative",  
      // 标识符绑定在这里  
      g: undefined  
    },  
    outer: <GlobalLexicalEnvironment>  
  }  
}

```

**注意**： 只有在遇到函数 <font color="#ff502c"> multiply </font> 的调用时才会创建函数执行上下文

在执行上下文创建阶段，**函数声明** 与 **var** 声明的变量在创建阶段已经被赋予了一个值，**var** 声明被设置为了 **undefined**，函数被设置为了 **自身函数**，而 **let**  **const** 被设置为未初始化。

这就是为什么你可以在声明之前访问 var 定义的变量（尽管是 undefined ），但如果在声明之前访问 let 和 const 定义的变量就会提示引用错误的原因,这就是所谓的 **变量提升**

## 总结

1. 全局执行上下文一般由浏览器创建，代码执行时就会创建；函数执行上下文只有函数被调用时才会创建，调用多少次函数就会创建多少上下文。

2. 调用栈用于存放所有执行上下文，满足FILO规则。

3. 执行上下文创建阶段分为绑定this，创建词法环境，变量环境三步，两者区别在于词法环境存放函数声明与const let声明的变量，而变量环境只存储var声明的变量。

4. 词法环境主要由环境记录与外部环境引入记录两个部分组成，全局上下文与函数上下文的外部环境引入记录不一样，全局为null，函数为全局环境或者其它函数环境。环境记录也不一样，全局叫对象环境记录，函数叫声明性环境记录。

5. 你应该明白了为什么会存在变量提升，函数提升，而let const没有。

## 参考
[理解 Javascript 执行上下文和执行栈]("https://juejin.im/post/5bdfd3e151882516c6432c32)


[一篇文章看懂JS执行上下文]("https://www.cnblogs.com/echolun/p/11438363.html")