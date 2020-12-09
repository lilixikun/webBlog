# Koa 实现

koa 源码中就四个主要文件，然后构建出这么经典的库，现在从零实现一版简历版 **koa** 并理解洋葱模型

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

**application** 文件主要有以下几个方法：

- use
- createContext
- handleRequest
- respond
- listen

```js
const http = require('http');
const EventEmitter = require('events');
const context = require('./context.js')
const request = require('./request.js')
const response = require('./response.js')

class Application extends EventEmitter {
    constructor() {
        super();
        this.middleware = []
        this.context = Object.create(context)
        this.request = Object.create(request)
        this.response = Object.create(response)
    }

    use(callback) {
        if (typeof callback !== "function") {
            throw new TypeError('middleware must be a function!')
        }
        this.middleware.push(callback)
        // 实现链式调用
        return this
    }

    compose(ctx) {
        const dispatch = (i) => {
            if (i === this.middlewares.length) return Promise.resolve()
            try {
                return Promise.resolve(this.middlewares[i](ctx, dispatch.bind(null, i + 1)))
            } catch (error) {
                return Promise.reject(error)
            }
        }
        return dispatch(0)
    }

    createContext(req, res) {
        const context = Object.create(this.context)
        const request = Object.create(this.request)
        const response = Object.create(this.response)

        context.request = request
        context.response = response

        context.request.req = context.req = req
        context.response.res = context.res = res

        return context
    }

    // 服务响应的方法，用来触发中间件
    handleRequest(req, res) {
        const ctx = this.createContext(req, res)
        this.compose(ctx).then(() => {
            this.respond(ctx)
        })
    }

    respond(ctx) {
        let body = ctx.body;
        const res = ctx.res;
        if (typeof body === 'object') {
            body = JSON.stringify(body);
            res.end(body);
        } else {
            res.end(body);
        }
    }

    listen(...arg) {
        const server = http.createServer(this.handleRequest.bind(this))
        server.listen(arg);
    }
}

module.exports = Application
```

**use** 方法不用多讲，我们可以通过 **app.use** 添加多个中间件，在起内部维护一个 ***middleware** 数组

**createContext** 主要是把 **req**和**res** 合并成一个 **ctx** 对象，我们可以通过 **ctx.req.path** 等方法去获取参数，通过 **ctx.body** 来返回

**handleRequest** 就是 **http.createServer** 的回调，用于触发 **createContext** 和 **respond**

**respond** 返回结果

## compose

为什么 **compose** 来单独拿出来说呢，因为它是koa的核心，也就是 **koa** 洋葱模型的原理。可以说，没有它就没有koa，在koa源码里面使用了 **koa-compose**，源码其实也就是上面，如下一个🌰：

```js
app.use(async (ctx, next) => {
    console.log('enter first middleware');
    await next();
    console.log('out first middleware');
});
app.use(async (ctx, next) => {
    console.log('enter second middleware');
    await next();
    console.log('out second middleware');
});
app.use(async (ctx, next) => {
    console.log('enter third middleware');
    await next();
    console.log('out third middleware');
});
```

我们都知道它的正确输出：

    enter first middleware
    enter second middleware
    enter third middleware
    out third middleware
    out second middleware
    out first middleware

为什么在经过 **compose** 操作后，中间件就能像上面哪有输出呢，我们回到代码。


```js
compose(ctx) {
    const dispatch = (i) => {
        if (i === this.middlewares.length) return Promise.resolve()
        try {
            return Promise.resolve(this.middlewares[i](ctx, dispatch.bind(null, i + 1)))
        } catch (error) {
            return Promise.reject(error)
        }
    }
    return dispatch(0)
}
```
我们的中间件经过 **compose** 包装后成了如下这样

```js
Promise.resolve( // 第一个中间件
 function(context,next){ // 这里的next第二个中间件也就是dispatch(1)
   // await next上的代码 （中间件1）
  await Promise.resolve( // 第二个中间件
   function(context,next){ // 这里的next第二个中间件也就是dispatch(2)
     // await next上的代码 （中间件2）
    await Promise.resolve( // 第三个中间件
     function(context,next){ // 这里的next第二个中间件也就是dispatch(3)
       // await next上的代码 （中间件3）
      await Promise.resolve()
      // await next下的代码 （中间件3）
     }
    )
     // await next下的代码 （中间件2）
   }
  )
   // await next下的代码 （中间件2）
 }
) 
```

通过这个现在我们可以很明确的知道了打印的顺序

## request

**request** 文件就是对 url 上一些参数的解析

```js
const parse = require('parseurl');
const qs = require('querystring');

module.exports = {
    /**
     * 获取请求头信息
     */
    get headers() {
        return this.req.headers;
    },
    /**
     * 设置请求头信息
     */
    set headers(val) {
        this.req.headers = val;
    },
    /**
     * 获取查询字符串
     */
    get query() {
        // 解析查询字符串参数 --> key1=value1&key2=value2
        const querystring = parse(this.req).query;
        // 将其解析为对象返回 --> {key1: value1, key2: value2}
        return qs.parse(querystring);
    }
}
```

## response

**response** 主要对返回的一些封装

```js
module.exports = {
    /**
     * 设置响应头的信息
     */
    set(key, value) {
        this.res.setHeader(key, value);
    },
    /**
     * 获取响应状态码
     */
    get status() {
        return this.res.statusCode;
    },
    /**
     * 设置响应状态码
     */
    set status(code) {
        this.res.statusCode = code;
    },
    /**
     * 获取响应体信息
     */
    get body() {
        return this._body;
    },
    /**
     * 设置响应体信息
     */
    set body(val) {
        // 设置响应体内容
        this._body = val;
        // 设置响应状态码
        this.status = 200;
        // json
        if (typeof val === 'object') {
            this.set('Content-Type', 'application/json');
        }
    },
}
```

## context

```js
const delegate = require('delegates');

const proto = module.exports = {};

// 将response对象上的属性/方法克隆到proto上
delegate(proto, 'response')
    .method('set')    // 克隆普通方法
    .access('status') // 克隆带有get和set描述符的方法
    .access('body')

// 将request对象上的属性/方法克隆到proto上
delegate(proto, 'request')
    .access('query')
    .getter('headers')  // 克隆带有get描述符的方法

```

到此，我们完成了一个简易版的 **koa**，并且深刻理解了 **洋葱模型** 的实现原理，[源码地址](https://github.com/LiLixikun/Blog-example/tree/master/packages/koa)