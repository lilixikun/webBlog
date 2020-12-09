

# webpack 基本使用

一句话总结: **webpack** 模块打包工具

## webpack-cli 的作用

webpack-cli 作用就是可以让我们执行 webpack 命令

## 基本使用

### 安装webpack

安装 webpack webpack-cli

```
npm install webpack webpack-cli -D
```

### 创建bundle 文件

- 在目录下新建一个 src 文件夹,新建 index.js 文件
- 在根目录下创建一个dist文件夹, 并在其中创建一个index.html文件

在 index.js 文件随便写点东西

```js
function component() {
    let element = document.createElement('div')
    element.innerHTML = "Hello Webpack"
    document.body.appendChild(element)
}

component()
```

在 index.html 里面引入将要打包生成后的 main.js

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>webpack 基础</title>
</head>

<body>
    <script src="main.js"></script>
</body>

</html>
```

## 执行打包

```
npx webpack
```
执行 **npx webpack**，会将我们的脚本作为入口起点，然后 输出 为 main.js。Node 8.2+ 版本提供的 npx 命令，可以运行在初始安装的 webpack 包(package)的 webpack 二进制文件（./node_modules/.bin/webpack）

发现 dist 目录下生成 **main.js**  在浏览器中打开 index.html，如果一切访问都正常，你应该能看到以下文本：'Hello webpack'。


### 使用一个配置文件

在根目录新建 **webpack.config.js** 目录

```js
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
```

现在，让我们通过新配置文件再次执行构建：

```
npx webpack --config webpack.config.js
```

### NPM 脚本

考虑到用 CLI 这种方式来运行本地的 webpack 不是特别方便，我们可以设置一个快捷方式。在 package.json 添加一个 npm 脚本(npm script)：

package.json

```json
...
"scripts": {
"test": "echo \"Error: no test specified\" && exit 1",
"build": "webpack"
},
...
```

可以使用 **npm run build** 命令，来替代我们之前使用的 npx 命令

```
npm run build
```

发现打包一切正常


## Loader 是什么

webpack 默认只能打包 JS 文件,打包别的文件需要借助 loader,只需要在 webpack.config.js 的 module 的 rules 加入相关的 loader

Loader 是有先后顺序的，**从下到上**，**从右到左**

## 管理资源

现在我们尝试整合一些其他资源，比如图像、看看 webpack 如何处理，让我们从 CSS 开始起步

### 打包 CSS 样式

为了从 JavaScript 模块中 import 一个 CSS 文件，你需要在 module 配置中 安装并添加 **style-loader** 和 **css-loader**：

```
npm install --save-dev style-loader css-loader
```

webpack.config.js

```js
module.exports = {
    ...
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loadder'
                ]
            }
        ]
    }
};
```

> webpack 根据正则表达式，来确定应该查找哪些文件，并将其提供给指定的 loader。在这种情况下，以 .css 结尾的全部文件，都将被提供给 style-loader 和 css-loader

这使你可以在依赖于此样式的文件中 import './style.css'。现在，当该模块运行时，含有 CSS 字符串的 **style** 标签，将被插入到 html 文件的 **head** 中。

我们尝试一下，通过在项目中添加一个新的 style.css 文件，并将其导入到我们的 index.js 中：

在 src 下新建 **style.css** 文件

```css
body {
    color: red;
}
```

在 index.js 文件中引入 

```
import './style.css'
```
现在运行构建命令：

```
npm run build
```

再次在浏览器中打开 index.html，你应该看到 Hello webpack 现在的样式是红色。查看页面的 head 标签。它应该包含我们在 index.js 中导入的 style 块元素

>因为loader的执行顺序是从右往左，从下往上的，webpack肯定是先将所有css模块依赖解析完得到计算结果再创建style标签。因此应该把style-loader放在css-loader的前面

**style-loader**的作用

style-loader 它的原理其实就是通过一个 JS 脚本创建一个style标签，里面会包含一些样式。并且它是不能单独使用的，因为它并不负责解析css之前的依赖关系

- 单独使用 css-loader 只能保证我们能引用 css 模块进来,但是没有效果
- style-loader 就可以创建一个 style 标签，并且把 引入进来的 css 样式塞到这个标签里面

> 有一点需要注意了:我们在当前项目的 js 中引入了几个css模块，它就会生成几个style标签

比如现在我在项目中又新建了一个style1.css文件并加上一些样式 在 index.js 引入 两个 Css 文件

重新 **npm run build** 打开页面

页面中确实是生成了两个 style 标签，而且样式的显示规则也是后面的覆盖前面的(style1.css比style.css晚引入)

**总结:**

**css-loader** 会帮我们分析各个文件之间的关系,最后合并为一个文件 **style-loader** 会把 **css-loader** 合并的文件挂在 header 的 style 标签 里面


### 使用 Sass

一样首先安装插件

```
npm install sass-loader node-sass webpack --save-dev
```

webpack.config.js

```js
{
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader']
}
```

### 使用 postcss-loader

作用: **postcss-loader** 中的 **autoprefixer** 插件，可以帮助我们自动给那些可以添加厂商前缀的样式添加厂商前缀 (-webkit   -moz   -ms   -o )


postcss-loader安装

```
npm i -D postcss-loader
```

由于 **postcss-loader** 需要 **autoprefixer** 插件，因此我们还需要安装 **autoprefixer** 插件：

```
npm install autoprefixer -D
```

配置 webpack.config.js


```js
{
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader','postcss-loader']
}
```

再根目录下新建 **postcss.config.js**

```js
module.exports = {
    plugins: [
        require('autoprefixer')
    ]
}
```

在 **package.json** 里面加入

```json
 "browserslist": [
    "defaults",
    "not ie <= 8",
    "last 2 versions",
    "> 1%",
    "iOS >= 7",
    "Android >= 4.0"
  ]
```

设置支持哪些浏览器，必须设置支持的浏览器才会自动添加浏览器兼容

再次执行打包 发现样式前面全部加入了前缀

我们经常会如以下引入样式

```css
@import './index.css';
```

这时,需要再次修改 webpack.config.js 的 scss 配置

```
{
    test: /\.scss$/,
    use: [
        'style-loader',
        {
            loader: 'css-loader',
            options: {
                importLoaders: 2
            }
        },
        'sass-loader',
        'postcss-loader'
    ]
},
```

> importLoaders：用于配置「css-loader 作用于 @import 的资源之前」有多少个 loader。

不配置的话可能会导致 **@import** 的资源不会被正确的加载,默认为 0

### file-loader

使用file-loader可以让我们在js和css中引入一些静态资源

打包完会把资源放在 **dist** 目录下并返回打包完后的名称以及返回文件地址

```
npm install --save-dev file-loader
```

webpack.config.js

```js
module.exports = {
    
    module: {
        rules: [
        ...
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader'
                ]
            }
        ],
    }
};
```

当你 import MyImage from './my-image.png'，该图像将被处理并添加到 output 目录, loader 会识别这是一个本地文件，并将 './my-image.png' 路径,替换为输出目录中图像的最终路径

在目录下 放一张图片 icon.jpg ,修改css

```css
body {
    color: red;
    background: url('../icon.jpg');
}
```

再次执行打包 ,发现 body 已经加上了 背景图


我们也可以使用 import Icon from '../icon.jpg' 来引入

index.js
```js
// 将图像添加到我们现有的 div。
var myIcon = new Image();
myIcon.src = Icon;

element.appendChild(myIcon);
```

发现 div 的背景图也加上了

在打包完的dist文件夹里, 会出现一个以 **MD5** 哈希值命名的png文件:

**file-loader** 还有很多其他的配置,都可以放在 option 里面,具体查看 [file-loader](https://www.webpackjs.com/loaders/file-loader/)


如将打包之后的图片存放到images文件夹下, 并且命名为图片的原始名称:

```js
module.exports = {
    
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                            outputPath: "images/",
                        },
                    }
                ]
            }
        ],
    }
};
```

再次执行打包完  发现  **dist** 多了一个 images 目录，并且命名为图片的原始名称

### 加载字体

加载 **字体** 和加载图片一样 都是使用 **file-loader**,不过我们需要配置一下

```
...
{
    test: /\.(woff|woff2|eot|ttf|otf)$/,
    use: [
        'file-loader'
    ]
}
```

在项目中添加一些字体文件：

通过配置好 loader 并将字体文件放在合适的地方，你可以通过一个 @font-face 声明引入。本地的 url(...) 指令会被 webpack 获取处理，就像它处理图片资源一样：

重新编译后 发现 我们自己的字体生效了


## 管理输出

webpack 的 **entry** 和 **output** 是允许你有多个输入 多个输出的 

### entry
默认入口 main.js

也可以是一个对象 引入多个文件,如下:

```js
entry: {
    app: './src/index.js',
    sub: './src/sub.js'
}
```
### output

**filename** 打包完的js 名称,默认打包名称 main.js

可以设置 '[name].js' 对应入口的 js 名称

如果我们想在静态资源CDN 服务器上访问我们的文件,可以设置 **publicPath**, 如:

```js
output: {
    //在服务器脚本用到，以确保文件资源能够在 http://xx:cnd 下正确访问
    publicPath: 'http://xx:cnd/',
},
```

### 基本配置

在 src 下新建 **print.js** 写些内容 并在 index.js 引入

webpack.config.js

```
module.exports = {
    entry: {
        app: './src/index.js',
        print: './src/print.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath:"/"
    },
}    
```

## SourceMap

- **source-map** 本质上一种映射关系 会生成一个 map 的文件
- **inline** 会打包在一个 js 文件
- **cheap** 打包在一个文件,只提示多少行,不管多少列,直管业务代码 不管依赖的 module
- **evel** 打包是最快的一种打包方式

本地可以配置 **cheap-module-source-map**

生产推荐使用 **cheap-module-eval-source-map**


## plugin
在webpack运行的生命周期中会广播出许多事件，plugin可以监听这些事件，在合适的时机通过 webpack 提供的 API 改变输出结果。它并不直接操作文件,而是基于事件机制工作,会监听 webpack 打包过程中的某些节点,执行广泛的任务

### HtmlWebpackPlugin

**HtmlWebpackPlugin** 会在打包结束之后,会自动生成一个 **html** 文件,并把打包完的文件自动引入

```
npm install --save-dev html-webpack-plugin
```

webpack.config.js

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    ...
    plugins: [
        new HtmlWebpackPlugin()
    ]
}
```

我们删除 dist 下的文件 重新执行 打包,发现自动给我们生成了 index.html 并帮我们把 js 都引入进去了


### clean-webpack-plugin

在每次构建前应该清理 /dist 文件夹,**clean-webpack-plugin** 是一个比较普及的管理插件，让我们安装和配置下。

```
npm install clean-webpack-plugin --save-dev
```

webpack.config.js

```js
const CleanWebpackPlugin = require('clean-webpack-plugin');

plugins:[
 new CleanWebpackPlugin(['dist']),
]
```
执行 打包 发现抛出错误

> TypeError: CleanWebpackPlugin is not a constructor

原因:如果你安装的 **clean-webpack-plugin** 是3.0 以上的话,必选要如下配置:


```js
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

plugins: [
    new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: ['dist']
    })
]
```

再次执行打包 发现OK 了

## webpack-dev-server

安装 webpack-dev-server

```
yarn add webpack-dev-server -D
```

配置 webpack.config.js

```js
...
devServer: {
    contentBase: './dist',
    open: true,
    prot: 8080,
    proxy: {
        "/api": "http://localhost:3000"
    },
},
...
```

启动 webpack 可以自动打开浏览器,并把端口设置为 8080,proxy 允许我们跨域访问

启动**热更新**,它允许在运行时替换，添加，删除各种模块，而无需进行完全刷新重新加载整个页面，其思路主要有以下几个方面

- 保留在完全重新加载页面时丢失的应用程序的状态
- 只更新改变的内容，以节省开发时间
- 调整样式更加快速，几乎等同于就在浏览器调试器中更改样式

```js
devServer:{
    hot:true,
    hotOnly:true
}
```

并添加插件

```js
plugins:[
    ...
    new webpack.HotModuleReplacementPlugin()
]
```

在JS使用热更新
```js
if (module.hot) {
    module.hot.accept('./sub', (sub) => {
        sub()
    })
}
```

解决单页面路由问题

**historyApiFallback: true**

通过传入一个对象，比如使用 rewrites 这个选项，此行为可进一步地控制：

```js
historyApiFallback: {
  rewrites: [
    { from: /^\/$/, to: '/views/landing.html' },
    { from: /^\/subpage/, to: '/views/subpage.html' },
    { from: /./, to: '/views/404.html' }
  ]
}
```

## 使用 Babel

安装相关插件
```
npm install --save-dev babel-loader @babel/core @babel/preset-env
```

使用 @babel/polyfill 补充低版本浏览器缺失的语法

```
npm install --save @babel/polyfill
```
在项目入口引入

```js
import "@babel/polyfill"
```

执行打包会发现打包体积巨大,那么我们如何做到只根据自己的业务代码去加载对应的 **polyfill** 呢

```js
{
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "babel-loader",
    options: {
        "presets": [['@babel/preset-env', {
            useBuiltIns: 'usage'
        }]]
    }
}
```

再次打包发现体积小了很多,只会去加载使用到的 polyfill

设置浏览器兼容版本

```js
{
    ...
    loader: "babel-loader",
    options: {
        "presets": [['@babel/preset-env', {
            "targets": {
              "edge": "17",
              "firefox": "60",
              "chrome": "67",
              "safari": "11.1",
            }
        ]]
    }
},
```

**@babel/polyfill** 那样引入会对我们的全局环境污染,对我们开发组件库或者库有影响,因此我们把上面的注释掉,换一种方式实现
```js
//import "@babel/polyfill"
```

### babel polyfill 有三种

**babel-runtime**

将es6编译成es5去运行，前端可以使用es6的语法来写，最终浏览器上运行的是es5, 不会污染全局对象和内置的对象原型。比如当前运行环境不支持promise，可以通过引入babel-runtime/core-js/promise来获取promise，或者通过babel-plugin-transform-runtime自动重写你的promise

**babel-plugin-transform-runtime**

自动添加babel-runtime/core-js并且映射ES6静态方法和内置方法,不会污染全局，对于库来说很实用。 一定要把babel-runtime作为依赖引入!

**babel-polyfill**

通过向全局对象和内置对象的prototype上添加方法来实现,他的原理是当运行环境中并没有实现的一些方法，babel-polyfill中会给做兼容

```
npm install --save-dev @babel/plugin-transform-runtime
npm install --save @babel/runtime
```

修改webpack 配置

```js
{
    test: /\.js$/,
    exclude: /node_modules/,
    loader: "babel-loader",
    options: {
        "plugins": [
            [
                "@babel/plugin-transform-runtime",
                {
                    "absoluteRuntime": false,
                    "corejs": false,
                    "helpers": true,
                    "regenerator": true,
                    "useESModules": false,
                    "version": "7.0.0-beta.0"
                }
            ]
        ]
    }
```

把 corejs 的 false 设置为 2 并安装

```
npm install --save @babel/runtime-corejs2
```

### 总结

- 项目业务代码直接 使用 @babel/preset-env 和 useBuiltIns
- 写组件库或者第三方组件 polyfill 会影响全局,因此使用@babel/plugin-transform-runtime
- 配置中 corejs 设置为 2 使用最新API

## Tree Shaking 

如果我们引入一个 JS 文件,但是只用了里面某些方法,但是打包依旧会把整个文件打包,因此 webpack 引入了 Tree Shaking,只会打包我们使用到的 文件

Tree Shaking 只支持 ES Module,也就是 important静态引入方式,不支持 CommonJS 动态引入方式

**development** 配置

```JS
optimization:{
    usedExports:true
}
```

### side-effect-free

通过 设置 pack.json 的 sideEffects 可以告诉 webpack 那些需要 进行 tree-shaking

```json
sideEffects:true
```

- true 所有文件都有副作用,全部不可 tree-shaking
- false 文件没有副作用,全都可以 tree-shaking

也可以设置那些文件需要 如下:

```json
sideEffects:[
    "../src/index.js",
    "*.css"
 ]
```

意思就是我们 src.index.js 和所有 important 引入的 CSS 都不用 tree-shaking

在 **production** 中 webpack 自动进行 Tree-Shaking
