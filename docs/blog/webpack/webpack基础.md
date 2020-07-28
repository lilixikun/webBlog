<!-- TOC -->

- [什么是 webpack](#什么是-webpack)
  - [webpack-cli 的作用](#webpack-cli-的作用)
  - [基本使用](#基本使用)
    - [安装webpack](#安装webpack)
    - [创建buildle 文件](#创建buildle-文件)
  - [执行打包](#执行打包)
    - [使用一个配置文件](#使用一个配置文件)
    - [NPM 脚本](#npm-脚本)
- [Loader 是什么](#loader-是什么)
  - [管理资源](#管理资源)
    - [打包 CSS 样式](#打包-css-样式)
    - [使用 Sass](#使用-sass)
    - [使用 postcss-loader 做浏览区厂商兼容](#使用-postcss-loader-做浏览区厂商兼容)
    - [file-loader](#file-loader)
    - [加载字体](#加载字体)
- [plugin](#plugin)
  - [管理输出](#管理输出)
  - [HtmlWebpackPlugin](#htmlwebpackplugin)
  - [clean-webpack-plugin](#clean-webpack-plugin)

<!-- /TOC -->

# 什么是 webpack 


一句话总结: **webpack** 模块打包工具

## webpack-cli 的作用

webpack-cli 作用就是可以让我们执行 webpack 命令

## 基本使用

### 安装webpack

安装 webpack webpack-cli

```
npm install webpack webpack-cli -D
```

### 创建buildle 文件

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
npm webpack
```
执行 **npx webpack**，会将我们的脚本作为入口起点，然后 输出 为 main.js。Node 8.2+ 版本提供的 npx 命令，可以运行在初始安装的 webpack 包(package)的 webpack 二进制文件（./node_modules/.bin/webpack）

发现 dist 目录下生成 **main.js**  在浏览器中打开 index.html，如果一切访问都正常，你应该能看到以下文本：'Hello webpack'。


### 使用一个配置文件

在根目录新建 **webpack.config.js** 目录

```
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

```
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


# Loader 是什么

webpack 默认只能打包 JS 文件,打包别的文件需要借助 loader,只需要在 webpack.config.js 的 module 的 rules 加入相关的 loader

Loader 是有先后顺序的,从下到上,从右到左

## 管理资源

现在我们尝试整合一些其他资源，比如图像，看看 webpack 如何处理,让我们从 CSS 开始起步

### 打包 CSS 样式

为了从 JavaScript 模块中 import 一个 CSS 文件,你需要在 module 配置中 安装并添加 **style-loader** 和 **css-loader**：

```
npm install --save-dev style-loader css-loader
```

webpack.config.js

```
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

```
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
- style-loader 就可以创建一个 style 标签,并且把 引入进来的 css 样式塞到这个标签里面

> 有一点需要注意了:我们在当前项目的 js 中引入了几个css模块，它就会生成几个style标签

比如现在我在项目中又新建了一个style1.css文件并加上一些样式 在 index.js 引入 两个 Css 文件

重新 **npm run build** 打开页面

页面中确实是生成了两个 style 标签，而且样式的显示规则也是后面的覆盖前面的(style1.css比style.css晚引入)

**总结:**

**css-loader** 会帮我们分析各个文件之间的关系,最后合并为一个文件 **style-loader** 会把 **css-loader** 合并的文件挂在 header 的 style 标签 里面


### 使用 Sass

一样首先安装 插件

```
npm install sass-loader node-sass webpack --save-dev
```

webpack.config.js

```
{
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader']
}
```

### 使用 postcss-loader 做浏览区厂商兼容

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


```
{
    test: /\.scss$/,
    use: ['style-loader', 'css-loader', 'sass-loader']
}
```



再根目录下新建 **postcss.config.js**

```
module.exports = {
    plugins: [
        require('autoprefixer')
    ]
}
```

在 **package.json** 里面加入

```
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

我们在 手写样式的时候经常会以下引入

```
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

使用file-loader可以让我们在js和css中引入一些静态资源, 

打包完会把 资源放在 dist 目录下 并返回 打包完后的名称以及返回文件地址

```
npm install --save-dev file-loader
```

webpack.config.js

```
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

当你 import MyImage from './my-image.png'，该图像将被处理并添加到 output 目录, loader 会识别这是一个本地文件，并将 './my-image.png' 路径，替换为输出目录中图像的最终路径

在目录下 放一张图片 icon.jpg ,修改css

```
body {
    color: red;
    background: url('../icon.jpg');
}
```

再次执行打包 ,发现 body 已经加上了 背景图


我们也可以使用 import Icon from '../icon.jpg' 来引入

index.js
```
// 将图像添加到我们现有的 div。
var myIcon = new Image();
myIcon.src = Icon;

element.appendChild(myIcon);
```

发现 div 的背景图也加上了

在打包完的dist文件夹里, 会出现一个以 **MD5** 哈希值命名的png文件:

**file-loader** 还有很多其他的配置,都可以放在 option 里面,具体查看 [file-loader](https://www.webpackjs.com/loaders/file-loader/)


如将打包之后的图片存放到images文件夹下, 并且命名为图片的原始名称:

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

再次执行打包完  发现  **dist** 多了一个 images 目录,并且命名为图片的原始名称

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


# plugin
在webpack运行的生命周期中会广播出许多事件,plugin可以监听这些事件，在合适的时机通过 webpack 提供的 API 改变输出结果。它并不直接操作文件,而是基于事件机制工作,会监听 webpack 打包过程中的某些节点,执行广泛的任务

## 管理输出

webpack 的 **entry** 和 **output** 是允许你有多个输入 多个输出的 

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

> webpack 提供一个非常有用的配置，该配置能帮助你为项目中的所有资源指定一个基础路径。它被称为公共路径.你想把这些静态文件统一使用CDN加载 只需要设置 publicPath:http:cdn.com.cn

执行打包 发现 **dist** 目录下生成了 **app.bundle.js** 和 **print.bundle.js** 更新 dist/index.html 文件分别引入这2个文件 

打开 index.js 发现里面的 js  都生效了


## HtmlWebpackPlugin

**HtmlWebpackPlugin** 会在打包结束之后,会自动生成一个 **html** 文件,并把打包完的文件自动引入

```
npm install --save-dev html-webpack-plugin
```

webpack.config.js

```
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    ...
    plugins: [
        new HtmlWebpackPlugin()
    ]
}
```

我们删除 dist 下的文件 重新执行 打包,发现自动给我们生成了 index.html 并帮我们把 js 都引入进去了


## clean-webpack-plugin

在每次构建前应该清理 /dist 文件夹,**clean-webpack-plugin** 是一个比较普及的管理插件，让我们安装和配置下。

```
npm install clean-webpack-plugin --save-dev
```

webpack.config.js

```
const CleanWebpackPlugin = require('clean-webpack-plugin');

plugins:[
 new CleanWebpackPlugin(['dist']),
]
```
执行 打包 发现抛出错误

> TypeError: CleanWebpackPlugin is not a constructor

原因:如果你安装的 **clean-webpack-plugin** 是3.0 以上的话,必选要如下配置:


```
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

plugins: [
    new CleanWebpackPlugin({
        cleanAfterEveryBuildPatterns: ['dist']
    })
]
```

再次执行打包 发现OK 了