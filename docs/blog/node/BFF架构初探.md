# BFF 架构初探

## 什么是BFF 以及 node.js 在BFF 层能做的事情

网上对BFF 有很多的长篇大伦,对我(搬砖党)来说 **BFF-服务于前端的后端**。 比如,现在有一个后端接口,他不满足我前段要求的数据格式,或者很多无用的数据格式,那我们就可以在**BFF**层把数据格式化。

因为前段需要什么数据自己是最清楚,那么理所应当 就该自己丰衣足食,毫无疑问用 Node 去做中间数据处理是最好不过的,因为都是JS 啊 😊

## 在Node的模版渲染

在没有Node中间层之前前段项目部署 都是 打包完生成 dist 目录丢给后端或者运维部署到 **nginx** 等上. 现在有了 Node 中间层后,我们可以通过 Node API接口吐出模版页面来。这里我们选择 **koa-swig** 模版引擎

```node
npm install koa-swig koa koa-static --save
```

## 启动一个 Node 服务 并配置 koa-swig

```js
const Koa = require('koa');
const serve = require('koa-static');
var render = require('koa-swig');
const co = require('co');

const app = new Koa();
const { port, viewDir, memoryFlag, staticDir } = require('./config')

app.use(serve(staticDir))

app.context.render = co.wrap(render({
    root: viewDir,
    autoescape: true,
    cache: memoryFlag, // disable, set to false
    ext: 'html',
    writeBody: false,
    varControls: ['[[', ']]']
}));

app.listen(port, () => {

});
```

## 新建 views 目录 并新建 index.html

## 编写路由并返回 index.html 页面

```js
const Router = require('koa-router')
const router = new Router()

router.get('/', async (ctx) => {
    ctx.body = await ctx.render('index')
})
```

启动Node服务, 成功访问我们刚才的页面。

>提示

如果启动页面发现只有一个 **{}**,则记住需要在 render前加上 **await**


## Node  真假路由混用

如上我们编写了后端路由,通常在我们前段 SPA 页面也有前段的路由. 以 **vue-cli** 打包后的为例。

访问 Node 渲染了前段 SPA页面, 页面再进行切换的时候没问题,但是刷新页面缺发现报错了. 这是为什么呢? 因为 Node 根本就没有前段 SPA 的路由, 因此我们需要用到 真假路由 。

```js
npm install koa2-connect-history-api-fallback
```

koa2的一个中间件，用于处理vue-router使用history模式返回index.html，让koa2支持SPA应用程序。

使用方法如下

```js
const { historyApiFallback } = require('koa2-connect-history-api-fallback');
// 可自行配置白名单
app.use(historyApiFallback({ whiteList: ['/api'] }));

```

再次刷新 SPA 页面 发现问题解决了

## Node 错误处理 
之前的文章已经详细的介绍 Node 如何处理全局异常 

[全局异常处理](https://juejin.im/post/5e970d0e51882573a343e2ab)

## JS type module 和 systemjs

使用JavaScript 模块依赖于**import**和 **export**,最新的浏览器开始原生支持模块功能了,浏览器能够最优化加载模块，使它比使用库更有效率：使用库通常需要做额外的客户端处理。

首先,你需要把 type="module" 放到 **script** 标签中, 来声明这个脚本是一个模块:

```html

<script type="module">
    // 1.支持module 支持nomodule
    import("./js/data.js").then(_ => {
        console.log(_.default);
    })
</script>
```

浏览器中可用的JavaScript模块功能的最新部分是动态模块加载。 这允许您仅在需要时动态加载模块，而不必预先加载所有模块。如上

那如果浏览区不支持 **module** 呢, 支持 **nomodule** 如下:

```js
<script type='nomodule'>
    ...
</script>
```

这个时候我们就需要用 **babel** 进行打包编译

如果浏览器既不支持 **module** 也不支持 **nomodule** 这个时候我们需要用到 **systemjs**
 
**安装依赖**

```
npm install @babel/cli @babel/core @babel/plugin-transform-modules-systemjs @babel/preset-env -D
```

**配置.babelrc**

```js
{
    "presets": [
        "@babel/preset-env"
    ],
    "plugins": [
        "@babel/plugin-transform-modules-systemjs"
    ]
}
```

**执行打包**

```js
    "build": "babel ./assets/scripts/data.js -o ./assets/scripts/data_bundle.js"
```

>**systemjs** 是一个 通用模块加载器，支持AMD、Commonjs、ES6等各种格式的js模块加载

在 ihdex.html 引入 systemjs

```html
<script nomodule src="https://cdn.staticfile.org/systemjs/6.3.3/system.js"></script>
    <script nomodule>
        // 不支持module 不支持nomodule 下面
        System.import("./scripts/data_bundle.js").then((_) => {
            console.log(_.default)
        });
    </script>
```

最坑的来了, 如果 支持 **module** 不支持 **nomodule**,那我们上面的代码会执行2次,那么怎么解决呢

```html
<script>
    (function () {
        var check = document.createElement('script');
        if (!('noModule' in check) && 'onbeforeload' in check) {
            var support = false;
            document.addEventListener('beforeload', function (e) {
                if (e.target === check) {
                    support = true;
                } else if (!e.target.hasAttribute('nomodule') || !support) {
                    return;
                }
                e.preventDefault();
            }, true);

            check.type = 'module';
            check.src = '.';
            document.head.appendChild(check);
            check.remove();
        }
    }());
</script>
```

总结如下:
- 支持module 支持nomodule
- 支持module 不支持nomodule xx 代码会执行2次
- 不支持module 不支持nomodule 


## 拦截后端接口并进行格式化

新建 controllers 目录 新建 Book.js

```js
const axios = require('axios');

class Book {
    static async getData() {
        const { data } = await axios.get('http://localhost:8080/book/list')
        data.forEach(item => {
            delete item.content
            delete item.page
        });
        return data
    }
}

module.exports = Book
```

如上 我们访问本地的java 接口 对返回的数据 进行了处理,删除了一些无用的数据

在我们的Node BFF 层进行调用

```js

router.get('/book/list', async (ctx) => {
    const data = await Book.getData()
    throw new Success(data)
})
```

这里可能就会问,这样我们的请求不就搞了两遍吗。 

- 前段发送请求到 Node BFF 层
- Node 再次发送请求到 JAVA获取到数据 并对数据进行处理进行返回

![图片.png](/node/node-bff.png)

因为到时候我们Node 会和 JAVA 服务部署到一台服务器,从本地读取数据速度会非常之快,因此不必担心影响请求相应速度.

## 小插件

你是否在目录过多时，导致引用一个文件而导致引用过多的 **"../"**,如下:

>require('../../../../some/very/deep/module')

安装 **module-alias** 解决上面的问题,用法如下: 

```js
const moduleAlias = require('module-alias');
moduleAlias.addAliases({
  '@root': __dirname,
  '@models': __dirname + '/models',
  '@controllers': __dirname + '/controllers',
});

// 引用 root 下的某个文件
import module from '@root/some-module'
```