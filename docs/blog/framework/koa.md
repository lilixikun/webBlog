# Koa 实现

koa 源码中就四个主要文件，然后构建出这么庆典的库，现在从零实现一版简历版 **koa** 并理解洋葱模型

## application

我经常使用 koa 来创建一个简单 服务 如下：
```js
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx) => {
  ctx.body = 'hello world';
});

app.listen(3000);
```

现在来实现它

```js
const http = require('http');
const EventEmitter = require('events');


class Application extends EventEmitter {
    constructor() {
        super();
        this.middleware = function () { }
    }

    use(callback) {
        this.middleware = callback
    }

    // 服务响应的方法，用来触发中间件
    handleRequest(req, res) {
        this.middleware(req, res);
    }

    listen(port) {
        http.createServer(this.handleRequest.bind(this)).listen(port);
    }
}

module.exports = Application
```

ok，现在来使用它

```js
const Koa = require('./application');

const app = new Koa()

app.use(async (ctx) => {

}

app.listen(9090)
```

我们启动程序

```js
node index.js
```

发现程序正常运行，并且显示了 hello:'clash'

在 koa 里面我们可以通过 **ctx.req** ，**ctx.request** ， **ctx.body** 等方法，现在来实现它

## request