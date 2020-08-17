# webpack 打包

## library 打包

在进行开发一个库时,我们需要支持 **AMD**,**CMD**,**CommonJS** 或者直接通过脚本引入得方法,那么怎么设置 webpack 配置呢

```
var path = require('path');

  module.exports = {
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'webpack-numbers.js',
      library: 'webpackNumbers',
      libraryTarget:'umd'
    }
  };
```

可以通过以下方式暴露 **library**
- 变量：作为一个全局变量，通过 script 标签来访问
- this：通过 this 对象访问
- window：通过 window 对象访问，在浏览器中
- UMD：在 AMD 或 CommonJS 的 require 之后可访问

## externals
如果我们的库文件里面用到了某个库,但是不想打包进去,可以按照下面设置

```
externals: {
 lodash: {
   commonjs: 'lodash',
   commonjs2: 'lodash',
   amd: 'lodash',
   root: '_'
 }
}
```
通常我们只需要设置 externals:['lodash'] 即可

## PWA

通常我们把打包完的文件放在服务器上,如果有一天服务器挂了,那么我们的页面就无法访问了,那么有没有这样一种方法,哪怕服务器挂了我们依然可以访问页面?


**workbox-webpack-plugin**

通过webpack中引用workbox-webpack-plugin插件简单实现浏览器缓存，防止服务器崩溃时候页面直接崩溃



基本配置 

```
const { GenerateSW } = require('workbox-webpack-plugin');
plugins: [
    new GenerateSW({
        clientsClaim: true,
        skipWaiting: true
    })
],
```

执行生产打包,发现多出一个 **service-worker**

在 index.js 写入

```js
const element = document.createElement('div')
element.classList.add('bg')
const img = document.createElement('img')
img.src = "https://dss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=2534506313,1688529724&fm=26&gp=0.jpg"
document.body.appendChild(element)
document.body.appendChild(img)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}
```

### 测试
我们用 http-server 启动当我们的静态服务器 来访问我们的 dist/index.html

```json
"start":"http-server dist",
```

启动后发现正常访问,现在把服务停掉,发现我们的页面能够正常访问.不仅本地静态资源图片能够显示,网络图片也被缓存下来了

我们可以查看 Chorme Tools -> Application -> Service Workers 进行了缓存注册

## 如何编写一个Loader


新建 loader/logger.js,现在编写一个替换的简单 loader

```
module.exports = function (source) {
    return source.replace('xikun', 'myloader')
}
```

在 index.js

```js
const name = 'xikun'
console.log(name)
```

执行打包,发现我们的 name 被替换了

现在我们给 loader  配置一些参数

```js
 use: [
        {
            loader: path.resolve(__dirname, './loaders/replaceLoader.js'),
            options: {
                name: 'replaceLoade'
            }
        },
        "babel-loader"
    ]
```

replaceLoader 接收参数如下
```
module.exports = function (source) {
    console.log(this.query);
    return source.replace('xikun', 'myloader')
}
```
执行打包我们发现可以拿到的参数,可以在这里面写自己自己的操作

经常看到 options 可以是一个字符串或者是对象,这样我们可以使用 **loader-utils**

如上我们获取 options 可以直接使用

```js
const options = loaderUtils.getOptions(this);
```

this.callback
一个可以同步或者异步调用的可以返回多个结果的函数。预期的参数是：
```js
this.callback(
  err: Error | null,
  content: string | Buffer,
  sourceMap?: SourceMap,
  meta?: any
);
```

- 第一个参数必须是 Error 或者 null
- 第二个参数是一个 string 或者 Buffer。
- 可选的：第三个参数必须是一个可以被这个模块解析的 source map。
- 可选的：第四个选项，会被 webpack 忽略，可以是任何东西

在开发环境 我们需要返回 source map,如果用上面的 **return** 肯定不行,改成 this.callback

**resolveLoader**

在上面使用 编写的loader 时候我们需要 这样引入 **path.resolve(__dirname, './loaders/replaceLoader.js')** 很不雅观,我们可以通过设置 resolveLoader 来达到和正常的 loader  引入一样

```js
resolveLoader: {
    modules: ['node_modules', 'loaders']
}
```

应用场景 如中英文多语言切换

我们就可以写自定义的 占位符 如[[title]] 当匹配到的时候就可以进行替换,对我们的代码无侵入式