# MPA性能优化小试

## 什么叫依赖注入IOC
对于这个概念,网上一大堆解决,说实话我也看不懂(也不想看😄),根据自己的理解总结了一下,例如:

我们的服务器应当知道路由的存在并且要使用它,我们当然可以通过硬编码的方式把这一依赖绑定到 app,如下:
```js
const apiRouter = require('./routers/api')
app.use('/api',apiRouter)
```
但是这是一件很痛苦的事情,我们可以使用依赖注入的方式松散的添加路由,如前面自动注册路由.

## 解藕
如我们 controllers 层需要用到 services 的服务 如

```js
import apiService from '../services/apiService'

router.get('/', async (ctx) => {
    const data = apiService.getData();
    ...
})
```
如果我们需要用到很多 service 需要一个引入,有没有一个方法可以让我们直接使用,就像下面这样

```java
Public Class A(){
    Public setB(B b){
    This.b = b;
 }
}
```

## awilix 实现依赖注入

```
yarn add awilix awilix-koa
```
**Awilix** 有非常简单的API,但是至少,我们需要做三件事:
- 创建一个容器
- 在其中注册一些模块
- 解决并使用

app.js

```js
import { createContainer, Lifetime } from 'awilix'
import { scopePerRequest, loadControllers } from 'awilix-koa'

// 创建容器
const container = createContainer()
// 自动注册 services
container.loadModules([`${__dirname}/services/*.js`], {
    formatName: 'camelCase',
    resolverOptions: {
        lifetime: Lifetime.SCOPED,
    },
});
// 注入
app.use(scopePerRequest(container));
```

新建 controllers/IndexController.js 编写一个路由
```js
import { route, GET } from 'awilix-koa'

@route('/')
class IndexController {
    constructor() { }
    @route('/')
    @GET()
    async getData(ctx) {
        ctx.body = "首页"
    }
}

export default IndexController
```
ok,我们执行下启动命令,看看调整写法后的
```
yarn server:dev
yarn server:start
```
启动发现终端有异常,如下:

![decorators.png](../../.vuepress/public/optimization/decorators.png)

缺少 **@babel/plugin-proposal-decorators**
```
yarn add @babel/plugin-proposal-decorators -D
``` 

配置 gulpfile 中的 babel
```js
babel({
    babelrc: false,
    plugins: [
        ['@babel/plugin-proposal-decorators', { 'legacy': true }],
        '@babel/plugin-transform-modules-commonjs'],
})
```
再次启动发现正常😊

## pajx的使用

现在我们修改下layout.html 在里面加入 **jquery.min.js**,我们启动服务访问下我们的路由,如下:

![more.png](../../.vuepress/public/optimization/more.png)

- 点开 Preserve log 保留请求日志，跳转页面的时候勾选上,可以看到跳转前的请求

我们在切换页面的时候 公共页面的资源每次都会被加载,这我们肯定不能忍受的,如何做到像 **vue-router** 和 **react-router** 那样切换路由

pjax 的工作原理是通过 ajax 从服务器端获取 HTML,在页面中用获取到的 HTML 替换指定容器元素中的内容。然后使用 **pushState** 技术更新浏览器地址栏中的当前地址。

- 按需请求，每次只需加载页面的部分内容，而不用重复加载一些公共的资源文件和不变的页面结构，大大减小了数据请求量，以减轻对服务器的带宽和性能压力，还大大提升了页面的加载速度。
- 只刷新部分页面,切换效果更加流畅,而且可以定制过度动画,优化页面跳转体验

说了这么多好处,这么香,难道没有缺点吗?

要做到普通请求返回完整页面，而pjax请求只返回部分页面,服务端就需要做一些特殊处理,使服务端处理变得复杂.

修改 公共页面 layout.html,加入
```html
 <div id="app">
        {% block content %}{% endblock %}
</div>
<script src="https://cdn.staticfile.org/jquery/3.5.1/jquery.js"></script>
<script src="https://cdn.staticfile.org/jquery.pjax/2.0.1/jquery.pjax.min.js"></script>
<script>
    $(document).pjax('a', '#app');
</script>
{% block scripts %}{% endblock %}
```
我们现在再点击切换页面可以看到下面 在请求头新增了 **X-PJAX** 字段

![pajx.jpg](../../.vuepress/public/optimization/pajx.jpg)


## 服务端处理

首先我们要判断是直接刷新的页面还是通过别的页面切换过来的,怎么判断呢,这个时候就要用到了 **X-PJAX** 字段了

```js
if (ctx.request.header['x-pjax']) {
    console.log('站内切');
} else {
    console.log('落地页');
}
```

在做 MAP 页面最忌讳的就是首页一下子返回一个大页面,这对体验很不好,因此我们要使用 **buffer** 让页面缓慢的流回来

因此我们做以下修改

```js
import { Readable } from "stream"

const data = await this.bookService.getData()
const html = await ctx.render('book/pages/list', {
    data
})
if (ctx.request.header['x-pjax']) {
    console.log('站内切');
} else {
    const htmlStream = new Readable();
    htmlStream.push(html)
    htmlStream.push(null)
    ctx.status = 200
    ctx.type = "html"
    htmlStream.on('error', err => { }).pipe(ctx.res)
}
```
好了,我们刷新页面,发现页面出现 **ok** 两个字,不用说,肯定是异步的问题,修改哈
```js
function createSSRStream() {
    return new Promise((resolve, reject) => {
        const htmlStream = new Readable();
        htmlStream.push(html)
        htmlStream.push(null)
        ctx.status = 200
        ctx.type = "html"
        htmlStream.on('error', err => reject).pipe(ctx.res)
    })
}
await createSSRStream()
```

ok,再次启动查看
![chunked.jpg](../../.vuepress/public/optimization/chunked.jpg)

发现请求头里面添加了 **Transfer-Encoding:chunked** 表示现在以及是以流的形式在进行传输

## 分块编码 Transfer-Encoding: chunked

当返回的数据比较大时，如果等待生成完数据再传输，这样效率比较低下。相比而言，服务器更希望边生成数据边传输。可以在响应头加上以下字段标识分块传输

```
Transfer-Encoding: chunked
```

**分块编码（Transfer-Encoding: chunked**

- Transfer-Encoding，是一个 HTTP 头部字段（响应头域），字面意思是「传输编码」。最新的 HTTP 规范里，只定义了一种编码传输：分块编码(chunked)
- 分块传输编码（Chunked transfer encoding）是超文本传输协议（HTTP）中的一种数据传输机制，允许HTTP由网页服务器发送给客户端的数据可以分成多个部分。分块传输编码只在HTTP协议1.1版本（HTTP/1.1）中提供。
- 数据分解成一系列数据块，并以一个或多个块发送，这样服务器可以发送数据而不需要预先知道发送内容的总大小。

## 解决站内切重复渲染
上面我们完成了落地页只刷采用 **stream** 流的放松传输,但是我们站内切还没解决

- 判断是否是站内切还是只刷落地页
- 只吐出部分 资源

**cheerio** 是专为服务器设计的核心jQuery的快速，灵活和精益实现。他可以像jquery一样操作字符串

```
yarn add cheerio
```

根据 我们读取 html 只返回我们对于节点的 资源
 ```js
if (ctx.request.header['x-pjax']) {
    const $ = cheerio.load(html)
    ctx.status = 200;
    ctx.type = 'html';
    $('.pjaxcontent').each(function () {
        ctx.res.write($(this).html());
    });
} 
 ```
 ok,我们再去浏览看看
![cheerio.png](../../.vuepress/public/optimization/cheerio.png)

这个时候发现,服务器只返回了部分需要更换的 HTML

对于页面返回的JS 加载我们也可以做标示返回,如下:
```js
$('.lazyload-js').each(function () {
    ctx.res.write(
        `<script class="lazyload-js" src="${$(this).attr('src')}"></script>`
    );
});
```
但是这个 class lazyload-js 怎么加上呢,这个文件是我们前段编写 webpack 插入到指定的位置,ok 我们修改下那里

htmlAfterplugin.js
```js
...
for (const jsitem of jsList) {
    js.push(`<script class="lazyload-js" src="${jsitem}"></script>`)
}
```
再次访问可以对于的JS也对应返回了

## 坑
在上面我们启动 客户端 dev 打包发现没任何问题,但是使用 **production** 打包,却发现出了问题.经排查,发现我们的js 并没有插入进去.

查看 **html-webpack-plugin** 发现,在 **production** 下 会进行压缩,清除**空格**,**注释**等,因此我们需要进行配置

```js
new HtmlWebpackPlugin({
    ...
    minify: {
        removeComments: false
    }
})
```

再次执行 生产环境打包,发现OK

## 思考
1. 如上我们设置了不清除注释,但是这肯定不行的,那我们如何做到替换完后再把注释清除掉呢?留下这个问题慢慢思考。。。
2. 我们在进行 同一个链接反复点击的时候,发现服务端会重复吐出一样的,如何做优化呢

## 总结
- awilix实现依赖注入
- pajx 实现路由切换
- 使用 chunked 分段传输
- 服务端判断处理并吐出对于的资源
