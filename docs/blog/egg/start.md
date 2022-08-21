# Egg基本知识

## 初始化项目

执行 
```bash
npm init egg --type=ts
npm i
npm run dev
```

关闭跨域请求、设置 config 下的 `config.default`
```ts
  config.security = {
    csrf: {
      enable: false,
    },
  };
```

## egg 插件使用

我们使用 `egg-view-nunjucks` 做一个模版渲染、首先安装对应插件 

```bash
npm install egg-view-nunjucks
```

在 config/plugin 里面开启插件 

```ts
config.view = {
  defaultViewEngine: 'nunjucks',
};
```

在 `config.default` 进行配置、

```ts
config.view = {
  defaultViewEngine: 'nunjucks',
};
```

搭建模版渲染默认使用 `nunjucks` 插件、并在 app目录下创建 `view` 目录、新建 `test.nj` 文件

```html
<body>
    <h1>Welcode to nj</h1>
    <img src="{{url}}">
</body>
```

新建一个路由获取模版文件

```ts
router.get('/test/getDog', controller.test.getDog)

// Controller
async getDog() {
  const { service, ctx } = this;
  const resp = await service.test.showDog();
  await ctx.render('test.nj', { url: resp.message });
}
// Service
async showDog() {
  const resp = await this.ctx.curl<DogResp>('https://dog.ceo/api/breeds/image/random', {
    dataType: 'json',
  });
  return resp.data;
}
```

访问本地 http://localhost:7001/test/getDog、一个模版就被渲染出来了、并且图片正常的渲染了

## 中间件 Middleware
 
现在开始从零开始编写一个 `egg` 中间件、首先创建 app/middleware 目录、新建一个记录请求响应时间的 `logger`

```ts
import { Context } from 'egg';
import { appendFileSync } from 'fs';

export default () => {
  return async (ctx: Context, next: () => Promise<any>) => {
    const startTime = Date.now();
    const requestTime = new Date();
    await next();
    const ms = Date.now() - startTime;
    const logTime = `${requestTime} -- ${ctx.method} -- ${ctx.url} -- ${ms}ms`;
    appendFileSync('./log.txt', logTime + '\n');
  };
};
```

在 config.default 配置使用中间件 

- 注意：中间件名字和文件名字对应

```ts
config.middleware = ['logger'];
```

再次访问上面的接口、可以看到在目录下 log.txt 记录下日志如下：

```txt
Sat Aug 06 2022 11:42:23 GMT+0800 (中国标准时间) -- GET -- /test/getDog -- 794ms
```

给中间件传递默认配置

```ts
export default (options: any, app: Application) => {
  return async (ctx: Context, next: () => Promise<any>) => {
    console.log('options', options);
    console.log('logger', app.config.logger);
  }
}
```

如上我们接收了 `options` 的配置、发现 ootions 打印了一堆我们不认识的。原因是因为中间 `logger` 是默认中间件、修改 `logger` 为 `myLogger`、并在 `config` 进行更新、设置默认配置

```ts
  const bizConfig = {
    myLogger: {
      allowedMethod: [ 'POST' ],
    },
  };
```
再次打印发现在 `options` 有了默认配置。
现在我们去掉全局配置，移除 `config.middleware = []`、在路由单个使用

```ts
export default (app: Application) => {
  const { controller, router } = app;
  const myLogger = app.middleware.myLogger(
    {
      allowedMethod: [ 'GET' ],
    },
    app,
  );
  router.get('/test/getDog', myLogger, controller.test.getDog);
};
```
发现编写的 `myLogger` 也生效了、但不会做用到全局。因此我们总结一下。`middleware` 中间件可以分为全局使用和单个使用，统一编写在 app/middleware 目录下。
- 当需求全局使用时，在 config 中添加即可、并且可以全局属性
- 也可以在具体路由中使用、用法和 koa 中间使用方法一致

## Config 配置文件
在 config 中经常会配置一些属性、参数；那么怎么才能在全局的 `controller` 和 `middleware` 以及 app 对象中自动获取类型提示呢? 如下在配置了以下参数，现在要实现的是全局能自动提示这些配置参数

```ts
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
    myLogger: {
      allowedMethod: [ 'POST' ],
    },
    baseUrl: 'def.url',
  };
```

鼠标放在默认导出的函数上提示我们的是以下类型：
```ts
const config = {} as PowerPartial<EggAppConfig>;

(property) default: (appInfo: EggAppInfo) => any
```
因此、当前我们是无法拿到正确的类型。然后我们看到 `PowerPartial` 把所有的 `EggAppConfig` 深层级的对象变成可选的、点进去查看 `EggAppConfig`

```ts
import { EggAppConfig } from 'egg';
import ExportConfigDefault from '../../config/config.default';
type ConfigDefault = ReturnType<typeof ExportConfigDefault>;
type NewEggAppConfig = ConfigDefault;
declare module 'egg' {
  interface EggAppConfig extends NewEggAppConfig { }
}
```

- ConfigDefault 用 ReturnType 拿到上面函数返回的类型、
- 新起别名 NewEggAppConfig 、然后 EggAppConfig 再继承于它

这么看来、问题应该是出在了上面函数访问为 `any` 导致没有正确类型、以至于没有类型提示、我们去查看返回

```ts
  return {
    ...config,
    ...bizConfig,
  };
```

看来是因为 `config` 导致了不能正确推断出类型、最以下修改后

```ts
  return {
    ...config as {},
    ...bizConfig,
  };
```

再去查看函数返回、有了正确提示
![default](/egg/default.png)

在 `controller` 中使用 `ctx.app.config` 可以拿到正确的提示、在 middleware 也能从 `EggAppConfig` 拿到它自己的正确的提示

![middare-tip](/egg/middare-tip.png)

## Extend 扩展
Extend 扩展
几大重要的概念的回顾

Application - 全局应用对象，只有一个实例
- ctx.app
- controller 和 service 通过 this.app 访问
- middleware 可以通过传入的参数拿到

Context - 上下文对象，每次请求生成一个实例
- controller 和 service 通过 this.ctx 访问
- middleware 可以通过传入的参数拿到

Request - 请求对象，来自 Koa
- ctx.request

Response - 响应对象，来自 Koa
- ctx.response
- 一个新的对象

Helper - 用来提供一些实用的 utility 函数。框架内置了几个简单的 Helper 函数。

下面自定义一个 `success` 的全局 `Helper` 扩展方法

在 app目录下新建 `extend/helper` 文件，新增以下方法：

```ts
import { Context } from 'egg';

interface RespType{
  ctx:Context
  res:any
  msg?:string
}
export default {
  success: ({ ctx, res, msg }:RespType) => {
    ctx.body = {
      error: 0,
      data: res ? res : null,
      msg: msg ? msg : '请求成功',
    };
    ctx.status = 200;
  },
};
```
现在就可以在返回数据的地方使用扩展方法 `success` 了、如下：

```ts
ctx.helper.success({ ctx, res: 'test' });
```

现在给全局 `Application` 扩展方法和属性、一样新建 `extend/application` 文件、新加一个打印方法如下：

```ts
import { Application } from 'egg';

export default {
  echo(msg:string) {
    const that = this as Application;
    return `hello ${msg} ${that.config.name}`;
  },
};

```
使用 `Application` 调用扩展方法
```ts
  const { ctx } = this;
  const msg = this.app.echo('test');
  console.log(msg);
```
现在定义一个扩展属性
```ts
const INITAnimal = Symbol('Application#init');

class Animal {
  options: any;
  constructor(options) {
    this.options = options;
  }
  eat(food:string) {
    console.log(`Animal eat ${food}`);

  }
}

export default {
  get animalInstance():Animal {
    if (!this[INITAnimal]) {
      this[INITAnimal] = new Animal({});
    }
    return this[INITAnimal];
  },
};
```
现在就可以直接使用了、如下：
```ts
  this.app.animalInstance.eat('rourou');
```

## 启动自定义

**必须是在根目录下，并且命名为 app.ts**

- 配置文件即将加载，这是最后动态修改配置的时机（configWillLoad）同步
- 配置插件加载完成（configDidLoad）同步
- 文件加载完成（didLoad）异步
- 插件启动完毕（willReady）异步
- 应用已经启动完毕 （didReady）异步
- http / https server 已启动 开始接受外部请求（serverDidReady）

在根目录新建 `app.ts`
```ts
import { IBoot, Application } from 'egg';

export default class AppBoot implements IBoot {
  private readonly app:Application;
  constructor(app:Application) {
    this.app = app;
  }
  configWillLoad() {
    // 此时 config 文件已经被读取合并、但是还未生效
    // 这是应用修改层最后时机
    console.log('config', this.app.config.baseDir);
    console.log('middleware', this.app.config.coreMiddleware);
  }
}
```
通过打印可以看到 `egg` 内置的一些中间件

```ts
middleware [ 'meta', 'siteFile', 'notfound', 'bodyParser', 'overrideMethod' ]
```
接下来我们在这里添加自定义的 `myLogger` 中间件、如下:

```ts
this.app.config.coreMiddleware.unshift('myLogger');
```
访问接口、发现中间件也生效了、因此我们得知了第三种添加中间件的方法

## 本地调试

egg 自带 logger 打印、默认等级如下：
- NONE
- DEBUG
- INFO
- WARN
- ERROR

默认等级只有 `INFO` 以上才会在终端打印输出、可以通过在 config 中设置 log 等级

```ts
ctx.logger.debug('debug info')
ctx.logger.info('res data', res.data)
ctx.logger.warn('warnning')
ctx.logger.error(new Error('whoops'))
// console level 配置
  config.logger = {
    consoleLevel: 'DEBUG'
}
```

在根目录新建 `.vscode/launch.json` 写入配置如下：

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Egg",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceRoot}",
      "runtimeExecutable": "npm",
      "windows": { "runtimeExecutable": "npm.cmd" },
      "runtimeArgs": [ "run", "debug" ],
      "console": "integratedTerminal",
      "protocol": "auto",
      "restart": true,
      "port": 9229,
      "autoAttachChildProcesses": true
    }
  ]
}
```
然后打上断点、点击运行-启动调试,就可以支持断点调试了
![debug](/egg/debug.png)


## 日志

egg 的日志由插件系统 `egg-logger`负责， https://github.com/eggjs/egg-logger

日志的位置在 **${appInfo.root}/logs/${appInfo.name}**

- baseDir 应用代码的目录
- HOME 用户目录，如 admin 账户为 /home/admin
- root 应用根目录，只有在 local 和 unittest 环境下为 baseDir，其他都为 HOME。

日志的分类

- appLogger ${appInfo.name}-web.log 应用相关日志，供应用开发者使用的日志。我们在绝大数情况下都在使用它。

- errorLogger common-error.log 实际一般不会直接使用它，任何 logger 的 .error() 调用输出的日志都会重定向到这里，重点通过查看此日志定位异常。

- coreLogger egg-web.log 框架内核、插件日志

- agentLogger egg-agent.log agent 进程日志

日志级别

日志分为 **NONE**，**DEBUG**，**INFO**，**WARN** 和 **ERROR** 5 个级别。
默认只会输出 INFO 及以上（WARN 和 ERROR）的日志到文件中，可以在配置中修改、同上
```ts
// config/config.${env}.ts
config.logger = {
  level: 'DEBUG',
};
```