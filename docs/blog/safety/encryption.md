# 前端加密与安全策略

## 混淆

JavaScript 作为一种运行在客户端的脚本语言，源代码对用户来说是完全可见的。但不是每一个JS开发者都希望自己的代码能被阅读，比如核心代码的书写等等。为了增加代码分析的难度，混淆工具被应用到了许多恶意软件(如挂马，跨站攻击等)。因此，为了分析这些也就有了反混淆。在相同语义的情况下压缩代码，比如去掉末尾分号，常量替换，移除空白代码。

::: warning 注意
全局变量不会更名 如LocalStorage
:::

常用的混淆技术 [uglify-js](https://github.com/mishoo/UglifyJS) 是目前最流行的 JavaScript 集压缩、合并混淆、source Map 等功能工具。

使用方式 
```js
npm install uglify-js
```

执行混淆命令 
```js
uglifyjs index.js -m
```

### 标识符混淆

如果你不想所有 JS 文件都混淆，可以，我们可以使用 [jsnice](http://jsnice.org/) 在线地址进行混淆，如下：

![jsnice1](/safe/jsnice1.png)

### 逻辑混淆

## 反混淆

不可能

## 加密

## 反加密