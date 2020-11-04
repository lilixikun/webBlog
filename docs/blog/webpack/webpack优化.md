# Webpack性能优化
Webpack性能优化 我会从几个大章节来讲述

## 压缩优化

### 深度 TreeShaking
- webpack-deep-scope-plugin
- webpack-parallel-uglify-plugin
- purifycss-webpack

### HTML 压缩
[HtmlWebpackPlugins](https://github.com/jantimon/html-webpack-plugin)压缩推荐选项
```js
new HtmlWebpackPlugin({
inlineSource: ".css$",
    template: path.join(__dirname, `src/${pageName}/index.html`), filename: `${pageName}.html`,
    chunks: ["vendors", pageName],
    inject: true,
    minify: {
        html5: true,
        collapseWhitespace: true,
        preserveLineBreaks: false,
        minifyCSS: true,
        minifyJS: true,
        removeComments: false,
}, });
```

### 图片压缩

[image-webpack-loader](https://www.npmjs.com/package/image-webpack-loader)

```js
rules: [{
  test: /\.(gif|png|jpe?g|svg)$/i,
  use: [
    'file-loader',
    {
      loader: 'image-webpack-loader',
      options: {
        bypassOnDebug: true, // webpack@1.x
        disable: true, // webpack@2.x and newer
      },
    },
  ],
}]
```

### CSS 压缩
[optimize-css-assets-webpack-plugin](https://www.npmjs.com/package/optimize-css-assets-webpack-plugin)
```js
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

optimization: {
    minimizer: [
        new OptimizeCSSAssetsPlugin({}),
    ],
},
```

## 打包速度优化

### 代码求值
[prepack-webpack-plugin](https://www.npmjs.com/package/prepack-webpack-plugin) 可以对之前的代码求值,让下次打包更快


```js
const PrepackWebpackPlugin = require('prepack-webpack-plugin').default;
 
const configuration = {};
plugins: [
new PrepackWebpackPlugin(configuration)
]
```

### speed-measure-webpack-plugin

[speed-measure-webpack-plugin](https://www.npmjs.com/package/speed-measure-webpack-plugin) 打包速度分析

```js
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const smp = new SpeedMeasurePlugin();
module.exports = smp.wrap(webpackConfig)
```

![speed-measure-webpack-plugin](https://raw.githubusercontent.com/stephencookdev/speed-measure-webpack-plugin/HEAD/preview.png)

### cache-loader
通过上面的工具,可以分析到那个 loader 速度过慢,我们就可以使用 [cache-loader](https://www.npmjs.com/package/cache-loader)

```js
rules: [
    {
        test: /\.js$/,
        use: ['cache-loader', 'babel-loader'],
        include: path.resolve('src'),
    },
],
```

### hard-source-webpack-plugin
如果你想开启全局的编译压缩可以使用 [hard-source-webpack-plugin](https://www.npmjs.com/package/hard-source-webpack-plugin)
```js
plugins: [
    new HardSourceWebpackPlugin()
]
```

### externals 代码拆分
externals 配置去掉不需要编译的，可以抛弃 dll

```js
splitChunks: {
  chunks: 'async',
  minSize: 30000,
  minChunks: 1,
  maxAsyncRequests: 5,
  maxInitialRequests: 3,
  name: false,
  cacheGroups: {
    commons: {
      chunks: 'initial',
      minChunks: 2,
      maxInitialRequests: 5,
      minSize: 0,
      name: 'commons',
    },
  },
}
```
分离⻚⾯公⽤包 [html-webpack-externals-plugin](https://www.npmjs.com/package/html-webpack-externals-plugin)

## 动态引入

### @babel/plugin-syntax-dynamic-import 
[@babel/plugin-syntax-dynamic-import](https://www.npmjs.com/package/@babel/plugin-syntax-dynamic-import)用以解析识别import()动态导入语法---并非转换,而是解析识别

```
npm install --save-dev @babel/plugin-syntax-dynamic-import
```
.babelrc

```json
{
  "plugins": ["@babel/plugin-syntax-dynamic-import"]
}
```
### 动态 polyfill
1. js脚本直接引入，不编译
```html
<script src="https://cdn.polyfill.io/v2/polyfill.min.js?feature=Map,Set"></script>
```
使⽤动态 polyfill,它会根据你的浏览器 UA 头,判断你是否⽀持某些特性,从⽽返回给你⼀个合适的 polyfill

```js
<script type="module" src="main.js"></script>
<script nomodule src="main.es5.js"></script>
```

2. 项目配置
```
npm install --save @babel/polyfill
```
项目入口引入 **@babel/polyfill**
```js
import "@babel/polyfill"
```
此时打包会发现体积很大,下面配置根据自己的业务代码去加载对应的 **polyfill** 

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
设置浏览器兼容版本
```js
{
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

## 配置优化

### noParse
这是module中的一个属性，作用:不去解析属性值代表的库的依赖,配置也很简单

```js
noParse:/jquery/  ,//不去解析jquery中的依赖库
```

### resolveLoader
如果我们编写了自定义的 Loarder,我们 需要引用 **path.resolve(__dirname, './loaders/replaceLoader.js')** 很不雅观,我们可以通过设置 resolveLoader 来达到和正常的 loader 引入一样

```js
resolveLoader: {
    modules: ['node_modules', 'loaders']
}
```

### resolve
合理的配置 **alias** 可以让我们在引用路径的时候更加方便,过多的配置会影响打包速度

```js
resolve: {
    alias: {
        '@': resolve('src/web')
    }
}
```

### shimming

使用 **shimming** 的配置如下

```js
const webpack = require('webpack');
plugins: [
    new webpack.ProvidePlugin({
        '$': 'jquery',
    })
]
```
 如果一个模块中使用了 **$** 字符串,就会在模块中自动得引用jquery

## 生产力工具

### progress-bar-webpack-plugin

[progress-bar-webpack-plugin](https://www.npmjs.com/package/progress-bar-webpack-plugin) 打包进度展示

![progress-bar-webpack-plugin](http://i.imgur.com/OIP1gnj.gif)

### friendly-errors-webpack-plugin

[friendly-errors-webpack-plugin](https://www.npmjs.com/package/friendly-errors-webpack-plugin) 识别某些类别的webpack错误，并清理，聚合和优先级，以提供更好的开发人员体验。

配合 **webpack-dev-server** 使用

```js
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
new FriendlyErrorsWebpackPlugin({
    compilationSuccessInfo: {
        messages: ['You application is running here http://localhost:8080'],
        notes: [
            'Some additionnal notes to be displayed unpon successful compilation',
        ],
    },
    onErrors: function (severity, errors) {
        //安装node-notifier 只想提示错误的话
    },
    quiet: true,
    clearConsole: true,
}),
```

![FriendlyErrorsWebpackPlugin](/webpack/FriendlyErrorsWebpackPlugin.png)

![filed](http://i.imgur.com/W59z8WF.gif)

### webpack-build-notifier
[webpack-build-notifier](https://www.npmjs.com/package/webpack-build-notifier) 可以更好的提示你运行状态

![build-notifier](/webpack/build-notifier.jpg)

### webpack-bundle-analyzer
[webpack-bundle-analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer) 是一款在线可视化分析你打包文件的工具,可以让你清楚的看到每个文件的大小

```js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
plugins:[
   new BundleAnalyzerPlugin(),  
]
```

![webpack-bundle-analyzer](https://cloud.githubusercontent.com/assets/302213/20628702/93f72404-b338-11e6-92d4-9a365550a701.gif)


### webpack-dashboard
[webpack-dashboard](https://www.npmjs.com/package/webpack-dashboard) 增强了 webpack 的输出，包含依赖的大小、进度和其他细节

![webpack-dashboard](http://i.imgur.com/qL6dXJd.png)

### 资源引用

[inline-manifest-webpack-plugin](https://www.npmjs.com/package/inline-manifest-webpack-plugin) 把 runtime 放到 html 里


[html-inline-css-webpack-plugin](https://www.npmjs.com/package/html-inline-css-webpack-plugin) 把一些核心的CSS放到⻚面内部

[html-webpack-inline-source-plugin](https://www.npmjs.com/package/html-webpack-inline-source-plugin) 内部资源引入

[copy-webpack-plugin](https://www.npmjs.com/package/copy-webpack-plugin) 用就是拷贝文件，或者文件夹

## 更多的构建工具

[lerna](https://github.com/lerna/lerna) 用于管理具有多个包的 JavaScript 项目

[brunch](https://brunch.io/) 超快的HTML5构建工具

[rome](https://www.romejs.cn/) Facebook最新JS工具

[snowpack](https://github.com/pikapkg/snowpack) 号称提高10倍打包速度

看到这里你以为就完了吗

## 彩蛋

你是否经常会开多个终端窗口,一多人就懵逼了,别怕 

[node-bash-title](https://www.npmjs.com/package/node-bash-title) 设置终端 title

[set-iterm2-badge](https://www.npmjs.com/package/set-iterm2-badge)  设置终端背景
```js
const setTitle = require('node-bash-title');
const setIterm2Badge = require('set-iterm2-badge');
setTitle('🍻  Webpack开发环境配置');
setIterm2Badge('🍻 Dev开发');
```
![node-iterm2](/webpack/node-iterm2.png)