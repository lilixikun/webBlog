# MPA 架构初探

## SPA 和 MPA 

- SPA 单页面应用
  
> 第一次进入页面会请求一个 html 文件,切花url,此时路径也相应变化,但是没有新的 html 文件请求,页面只在片段间切换 . 最显著特征 根节点只有一个 root 节点,空架子

原理: 使用浏览器 **pushState**  等 API 讲下一个页面的内容挂在到当前页面,路由由前段自己控制

总结:
- 页面跳转:JS 渲染
- 优点: 页面切换快
- 首屏时间慢,SEO 差

多适用于后台管理系统

- MAP 多页面应用
  
> 每一次页面请求,都会返回一个新的 html 文档, 内容都是全部填充好的

总结:
- 页面跳转:返回完整的 HTML
- 首屏时间快,SEO 好
- 页面切换慢


## 前段模板渲染

在上一章节,我们使用 **koa-swig** 来作为前段模板渲染,现在我们来完善一下

在 src/web 下 新建 **components** 和 **views** 文件夹
> components 存放我们的组件
> views 视图页面

在 views/layouts 新建 layout.html 写入页面基本布局

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>{% block title %}{% endblock %}</title>
    {% block head %}{% endblock %}
</head>

<body>
    <div>
        {% block content %}{% endblock %}
    </div>
    {% block scripts %}{% endblock %}
</body>

</html>
```

不了解 **koa-swig** 模板语法的可以去看下如何使用 **https://www.npmjs.com/package/koa-swig**

在 components 目录下新建 banner 组件 
**banner.html**
```html
<div class="baner">
    <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/book/list">展示图书</a></li>
        <li><a href="/book/create">添加图书</a></li>
    </ul>
</div>
```
**banner.js**
```js
const banner = {
    init() {
        console.log('banner.js 加载');
    }
}

export default banner
```

ok,现在在 views 下需要写一点我们自己的业务页面代码了,来个books 吧

新建 views/books/pages

**create.ihtml**, **list.html**
```html
{% extends '@layouts/layout.html' %}

{% block title %} 图书列表页📚 {%endblock %}

{% block head %}
<!--injectcss-->
{% endblock %}

{% block content %}
{% include "../../../components/banner/banner.html" %}
<h1>展示图书</h1>
{% endblock %}

{% block scripts %}
<!--injectjs-->
{% endblock %}
```
上面的 HTML 表示继承 **layout.html** 并在 content 插入我们上面定义的 banner 组件

## 编写前段的 webpack 配置

```
npm install webpack webpack-cli webpack-merge npm-run-al scripty -D
```

在 **package.json** 添加命名

```js
  "scripts": {
    "client:dev": "scripty",
    "client:prod": "scripty",
    "server:start": "scripty",
    "server:dev": "scripty",
    "server:prod": "scripty",
    "test": "mocha --exit",
    "build": "npm-run-all --parallel client:prod server:prod"
  },
```

- **scripty** 用法查看 [scripty](https://www.npmjs.com/package/scripty)

在根目录下新建 scripty/client  scripty/server

**dev.sh**
```
webpack --mode development
```

**prod.sh**
```
webpack --mode production
```

编写 **webpack.config.js**

根目录下新建 config/webpack.development.js  config/webpack.production.js

**/webpack.development.js**
```js
const { join } = require('path')

module.exports = {
    output: {
        path: join(__dirname, '../dist/assets'),
        publicPath: '/',
        filename: 'scripts/[name].bundle.js',
    },
}
```

**yargs-parser** 可以获取 命名行参数,可以动态读取合并 webpack 配置文件

```js
const { merge } = require('webpack-merge')
const { resolve } = require('path')
var argv = require('yargs-parser')(process.argv.slice(2))
const _mode = argv.mode || 'development'
const _mergeConfig = require(`./config/webpack.${_mode}.js`);

const webpackConfig = {
    entry: _entry,
   
    optimization: {
        runtimeChunk: {
            name: 'runtime'
        }
    },
     resolve: {
        alias: {
            '@': resolve('src/web')
        }
    }
}

module.exports = merge(webpackConfig, _mergeConfig)
```

现在我们来获取 webpackConfig 的  entry 入口文件

按照我们的项目目录结构 我们要把  **src/web/views/books/pages/*.html** 进行输出

现在 html 文件有了,但是现在有个问题,我们光有 **HTML**,不能没有 **JS** 文件啊

OK, 我们在每个模块下 新建 ***.entery.js** 如 **src/web/views/books/book-list.enter.js**,加载我们需要的js

```js
import banner from '@/components/banner/banner.js'
banner.init()
console.log('book list js running')
```

我们利用 **sync** 来读取对应目录下的所有的 ***entry.js** 当我们的 entry 入口 文件


```js
const { sync } = require('glob')
const files = sync('./src/web/views/**/*.entry.js')

const _entry = {};

for (const item of files) {
    if (/.+\/([a-zA-Z]+-[a-zA-Z]+)(\.entry\.js)/g.test(item) == true) {
        const entryKey = RegExp.$1
        _entry[entryKey] = item;
        const [dist, template] = entryKey.split('-')
        _plugins.push(
            new HtmlWebpackPlugin({
                filename: `../views/${dist}/pages/${template}.html`,
                template: `src/web/views/${dist}/pages/${template}.html`,
                chunks: ['runtime', entryKey],
                inject: true
            })
        )
    } else {
        console.log('🐷,匹配失败!')
        process.exit(-1)
    }
}
// _entry
// {
//   'book-create': './src/web/views/book/book-create.entry.js',
//   'book-list': './src/web/views/book/book-list.entry.js'
// }
```

现在试试打包一下 **JS** 文件,现在执行下 编译命令

```
yarn client:dev
```
发现我们打包成功了,模板正常输入, **JS** 文件也被编译成功并插入到 末尾 如下:

```html
{% block scripts %}
<!--injectjs-->
{% endblock %}<script src="/scripts/runtime.bundle.js"></script><script src="/scripts/book-list.bundle.js"></script>
```

但是问题来了,我们在上面的模板 放置了 *<!--injectjs-->* 代表我们要把 js 文件插入到对应的这个位置来,怎么办呢

- 首先不让 **HtmlWebpackPlugin** 在尾部插入 JS 文件了,设置 **inject:false**
- 写插件在 HTMl 模板 **<!--injectjs-->** 插入我们打包完的 js  文件


## 编写 Webpack 插件 在特定位置插入 JS 

在 config 下新建 **HtmlAfterPlugin.js** 

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pluginName = 'HtmlAfterPlugin'

const assetHelp = jsList => {
    let js = [];
    for (const jsitem of jsList) {
        js.push(`<script src="${jsitem}"></script>`)
    }
    return js
}

class HtmlAfterPlugin {

    constructor() {
        this.jsarr = []
    }

    apply(compiler) {
        compiler.hooks.compilation.tap(pluginName, (compilation) => {

            // 获取 js 资源
            HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(
                pluginName,
                (data, cb) => {
                    const { js } = data.assets;
                    this.jsarr = assetHelp(js)

                    cb(null, data)
                }
            )
            // 获取 HTML 模版字符串
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
                pluginName,
                (data, cb) => {
                    let _html = data.html
                    _html = _html.replace(/@components/g, '../../../components')
                    _html = _html.replace(/@layouts/g, '../../layouts')
                    // 替换 <!--injectjs--> 并插入 js
                    _html = _html.replace(/<!--injectjs-->/g, this.jsarr.join(''))
                    data.html = _html
                    cb(null, data)
                }
            )
        })
    }
}

module.exports = HtmlAfterPlugin
```

上面我们就编写了一个自己的 webpack 插件
- 利用 HtmlWebpackPlugin 的 Hooks 去获取资源
- 根据自己的需求进行替换 html 字符

::: tip
/@components/g, '../../../components'
:::

Ok,把我们的 插件用到 配置中

```js
const HtmlAfterPlugin = require('./config/htmlAfterplugin')
const webpackConfig = {
    ...
    plugins: [
        ..._plugins,
        new HtmlAfterPlugin()
    ]
}

```
再次执行编译  list.html

```html
...
{% block scripts %}
<script src="/scripts/runtime.bundle.js"></script><script src="/scripts/book-create.bundle.js"></script>
{% endblock %}
```

Ok 美滋滋,我们的 JS 正确的插入到位置中了


## 编写 Views 生产环境的 webpack

上面我们只会部分 HTMl 进行了输出,那肯定不行,我们的组件 components 和 layouts 都没移过来

你会说这个活我会,我 **CV** 过来不就行了吗。 能自动搞的坚决不手动

```
npm install copy-webpack-plugin html-minifier
```

```js
const { join } = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const minify = require('html-minifier').minify;
module.exports = {
    output: {
        path: join(__dirname, '../dist/assets'),
        publicPath: '/',
        filename: 'scripts/[name].[contenthash:5].bundle.js',
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {
                    from: join(__dirname, '../', 'src/web/views/layouts/layout.html'),
                    to: '../views/layouts/layout.html',
                },
            ],
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'src/web/components/**/*.html',
                    to: '../components',
                    transform(content, absoluteFrom) {
                        const resutlt = minify(content.toString('utf-8'), {
                            collapseWhitespace: true,
                        });
                        return resutlt;
                    },
                    transformPath(targetPath, absolutePath) {
                        // windows targetPath.replace(/src\\web\\components\\/g, '');
                        return targetPath.replace('src/web/components/', '');
                    },
                },
            ],
        }),
    ],
};
```

我们使用 **CopyPlugin** 把文件 Copy 了在对应目录下, 并用 **minify** 进行了压缩, 执行打包编译, 发现所有的都压缩了,真香!

## 使用 Gulp 对 Node 进行编译

原来我们 Node 里面都是使用 **CommonJS** 现在全部改成 **ES6**写法,不用说,肯定需要编译

```
npm install --save-dev gulp gulp-babel "@babel/cli @babel/core @babel/preset-env @babel/plugin-transform-modules-systemjs gulp-watch
```

新建一个 gulpfile.js 编写

```js
const gulp = require('gulp')
const watch = require('gulp-watch')
const plumber = require('gulp-plumber');
const babel = require('gulp-babel')

const entry = './src/server/**/*.js'

function builddev() {
    return watch(entry, { ignoreInitial: false }, () => {
        gulp
            .src(entry)
            .pipe(plumber())
            .pipe(
                babel({
                    babelrc: false,
                    plugins: ['@babel/plugin-transform-modules-commonjs'],
                })
            )
            .pipe(gulp.dest('dist'))
    })
}

let build = gulp.series(builddev)
gulp.task('default', build)
```

> gulp-plumber 防止程序挂掉重启

编写 server 端的 scripts 的脚本 

**dev.sh**
```
cross-env NODE_ENV=development gulp
```

Ok,终端开两个窗口 分别启动

```
yarn server:dev
yarn server:start
```

折腾了这么多,终于看见 页面渲染了

## 对 Node 文件进行清洗

如我们的的 src/server/confin.js 

```js
import { extend } from 'lodash'
import { join } from 'path'
let config = {
    viewDir: join(__dirname, "..", "views"),
    staticDir: join(__dirname, "..", "assets")
}

if (process.env.NODE_ENV == "development") {
    let localConfig = {
        port: 8081,
        memoryFlag: false
    }
    config = extend(config, localConfig)
}
else if (process.env.NODE_ENV == "production") {
    let localConfig = {
        port: 8080,
        memoryFlag: "memory"
    }
    config = extend(config, localConfig)
}

export default config
```

在生成环境就可以把 development 的 if 分支干掉

使用 **gulp-rollup** 对文件进行清洗

安装插件
```
npm install gulp-rollup @rollup/plugin-replace -D
```

编写生成环境 gulp  命名

```js
const cleanEntry = './src/server/config/index.js'

function buildprod() {
    return gulp
        .src(entry)
        .pipe(
            babel({
                babelrc: false,
                ignore: [cleanEntry],
                plugins: ['@babel/plugin-transform-modules-commonjs'],
            })
        )
        .pipe(gulp.dest('dist'))
}

function buildconfig() {
    return (
        gulp
            .src(entry)
            .pipe(
                rollup({
                    input: cleanEntry,
                    output: {
                        format: 'cjs',
                    },
                    plugins: [
                        replace({
                            'process.env.NODE_ENV': JSON.stringify('production'),
                        }),
                    ],
                })
            )
            // .pipe(prepack({}))
            .pipe(gulp.dest('dist'))
    );
}
```
上面的命名就是我们对 config/index.js 进行清洗, 然后修改 我们的 NODE_ENV 为 **production**, 因为我们的启动命名都是一个

```
cross-env NODE_ENV=development nodemon ./dist/app.js
```

执行 **yarn server:prod** 查看下 config.js

```js
'use strict';

var lodash = require('lodash');
var path = require('path');

let config = {
    viewDir: path.join(__dirname, "..", "views"),
    staticDir: path.join(__dirname, "..", "assets")
};

{
    let localConfig = {
        port: 8080,
        memoryFlag: "memory"
    };
    config = lodash.extend(config, localConfig);
}

var config$1 = config;

module.exports = config$1;

```

if 分支去掉了,进行了清洗,文件清爽了很多。


## 总结

- 使用 **koa-swig** 模板,可以进行组件化开发,但是需要在特定位置插入规定的文件
- 编写 webpack 对我们需要的文件页面进行打包 输出
- 编写 自定义的 webpack 插件 在 HTML 插入我们需要的 JS 文件
- 搭建 Node 服务 返回 HTML 模板页面
- 使用 Gulp 对 CommonJS 进行编译
- 使用 gulp-rollup 对文件进行清洗