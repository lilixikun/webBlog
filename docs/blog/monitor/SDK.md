# 前端监控 SDK 开发

## 构建方案

| 构建方案             | 优点                                          | 缺点                     | 是否采用 |
| -------------------- | --------------------------------------------- | ------------------------ | -------- |
| webpack              | 通用强、插件丰富、兼容性强                    | 不适合做 lib 包开发      | 否       |
| rollup + ts          | 打包 tree shaking 好、通常开发 lib 选择方案   | 开发环境不友好、配置繁多 | 否       |
| esbuild              | 开发体验好、加载快                            | 只支持 esmodule          | 否       |
| microbundle + parcel | 开箱即用、零配置、底层 rollup、适合开发 SD 看 | 无                       | 是       |

## 浏览器的 5 种 Observer

- MutationObserver 监听 DOM 树的变化（属性、子节点的增删改）
- IntersectionObserver: 监听一个元素和可视区域相交部分的比例，然后在可视比例达到某个阈值的时候触发回调
- PerformanceObserver：用于监测性能度量事件，在浏览器的性能时间轴记录下一个新的 performance entries 的时候将会被通知。
- ResizeObserver：接口可以监听到 DOM 的变化（节点的出现和隐藏，节点大小的变化）
- ReportingObserver：监听过时的 api、浏览器的一些干预行为的报告

根据前面的架构设计、我们将使用 **IntersectionObserver** 进行埋点监控的 SDK 开发、用于开发 PV、Click、EXP(曝光)、自定义等功能、下来介绍下 **IntersectionObserver** 的基本用法

### 基本用法

- 监听一个目标元素

```js
const intersectionObserver = new IntersectionObserver(callback, options);
intersectionObserver.observer("dom1");
intersectionObserver.observer("dom2");
```

- 停止监听

```js
intersectionObserver.disconnect();
```

- 停止对特定目标元素监听

```js
intersectionObserver.unobserve(targetElement);
```

- 返回所有观察目标的 IntersectionObserverEntry 对象数组。

```js
intersectionObserverEntries = intersectionObserver.takeRecords();
```

### 配置项

- targetElement: 目标 DOM
- root: 指定根目录，也就是当目标元素显示在这个元素中时会触发监控回调
- rootMargin: 类似于 css 的 margin，设定 root 元素的边框区域。
- threshold: 阙值.决定了什么时候触发回调函数（比如看到元素的多大就触发、如 [0.5] 看到一半）

### 返回参数

- time: 可见性发生变化的时间，是一个高精度时间戳，单位为毫秒
- rootBounds: 是在根元素矩形区域的信息
- intersectionRatio: 目标元素的可见比例
- intersectionRect: 目标元素与根元素交叉区域的信息
- isIntersecting: 判断元素是否符合 options 中的可见条件
- boundingClientRect: 目标元素的矩形区域的信息
- target: 被观察的目标元素

具体可以参考阮一峰老师的教程：https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html

## SDK 设计

在开发 SDK 之前我们要思考

- sdk 使用如何简单、比如接入方式、只需要简单 **new** 一下即可完成、传入自己的 appId 应用标识
- sdk 足够灵活、能提供各种 hooks 方法、比如上报前、后的生命钩子、以及能支持对上报参数的修改、合并等等
- sdk 上报方法简单、无论是 pv、click、exp 等都支持手动和自动等方式切方法统一
- sdk 支持自定义、对特定 dom 上报方式运行可自定义进行操作

因为一个基础的 SDK 模型就出来了

### Monitor

```ts
import qs from "qs";
import MonitorObserver from "./observe";
import {
  MonitorOption,
  AskPriority,
  AnalyticsData,
  Fun,
  Fn,
} from "./typings/index";

const uploadUrl = "http://localhost.8080/api/";

class Monitor {
  options: MonitorOption;
  // 参数创建前
  beforeCreateParams: Fun;
  // 上报日志前
  beforeUpload: Fun;
  // 上报日志后
  afterUpload: Fun;
  onError: Fun;
  private observer: MonitorObserver;
  constructor(options: MonitorOption) {
    this.options = options;
    this.collect();
    this.beforeCreateParams = null;
    this.beforeUpload = null;
    this.afterUpload = null;
    this.onError = (err: Error) => console.error(err);
    this.observer = new MonitorObserver(this);
  }
  /**
   * 收集浏览器基本信息
   * @returns
   */
  private collect() {}

  /**
   * 上报数据
   * @param data
   */
  private upload(data: string) {}

  /**
   * 上报执行前钩子函数
   * @param fn
   */
  registerBeforeCreateParams(fn: Fn) {
    this.beforeCreateParams = fn;
  }

  /**
   * 上报执行前参数 transforme 钩子函数
   * @param fn
   */
  registerBeforeUpload(fn: Fn) {
    this.beforeUpload = fn;
  }

  /**
   * 上报执行完钩子函数
   * @param fn
   */
  registerAfterUpload(fn: Fn) {
    this.afterUpload = fn;
  }

  /**
   * 上报错误钩子函数
   * @param fn
   */
  registerOnError(fn: Fn) {
    this.onError = fn;
  }

  /**
   * 发送PV、曝光、点击 日志
   * @param data
   */
  sendToAnalytics(data: AnalyticsData) {
    this.beforeCreateParams && this.beforeCreateParams();
    if (!data.pageId) {
      throw new Error("请传入 pageId、⚠️");
    }
    // 采集页面的基本信息
    // 1. 应用
    //    a. 应用id (SDK 初始化)
    //    b. 页面id (sendPv 自己带来)
    let body = {
      ...data,
      appId: this.options.appId,
      pageId: data.pageId,
      eventType: data.eventType || "pv",
    };
    // 2. 页面上报信息收集
    //    a. 应用id和页面id
    //    b. 访问时间
    //    c. ua
    const navigatorInfo = this.collect();
    Object.assign(body, navigatorInfo);

    // 3. 调用日志上报API
    if (this.beforeUpload) {
      body = this.beforeUpload(body);
    }
    const qsdata = qs.stringify(body);
    try {
      this.upload(qsdata);
      throw new Error("错误");
    } catch (error) {
      // console.error(error);
      this.onError && this.onError(error);
    } finally {
      this.afterUpload && this.afterUpload(body);
    }
  }
}

export default Monitor;
```

在接入过程中只需要简单 **new** 一下传入规定的字段即可、也可以返回一个实例化后的 Monitor、由我们调用 init 初入参数即可

```ts
const monitor = new CodeRobotMonitor({
  appId: "123",
});

monitor.registerBeforeCreateParams(() => {
  console.log("注册自定义的请求前函数");
});

monitor.registerBeforeUpload((body) => {
  body.name = "xikun";
  return body;
});

monitor.registerOnError((err: any) => {
  console.error(err.message);
});

// 发送 pv 上报
monitor.sendToAnalytics({
  pageId: "home",
});
```

### 上报方式的降级处理

通常上报数据最经典的莫过于使用 1kb 的 gif 进行上报数据、但是根据需要可以进行一系列的配置，分别优先级为：

- 原生 fetch
- 原生 XMLHttpRequest
- navigator.sendBeacon
- Image

如下：

```ts
const level = this.options.level || 3;
if (level === AskPriority.URGENT) {
  if (!!window.fetch) {
    window.fetch(`${uploadUrl}?${data}`);
  } else {
    let xhr: XMLHttpRequest | null = new XMLHttpRequest();
    xhr.open("post", uploadUrl, true);
    // 设置请求头
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data); // 发送参数
    xhr.onload = function(e) {
      //及时清理以防多次创建
      xhr = null;
    };
  }
} else if (level === AskPriority.IDLE) {
  if (!!navigator.sendBeacon) {
    navigator.sendBeacon(uploadUrl, data);
  }
} else if (level === AskPriority.IMG) {
  let img: HTMLImageElement | null = new Image();
  img.src = `${uploadUrl}?${data}`;
  img.onload = function() {
    //统计完成收回创建的元素防止内存泄露
    img = null;
  };
}
```

### 曝光埋点的处理

针对曝光埋点、都是由不可见变为可见、有以下两种情况

- 渲染未显示、比如商品瀑布流
- 最初未渲染、比如动态创建了 DOM

针对第一种情况、我们直接使用 **IntersectionObserver** 对我们要曝光的 dom 进行监听即可、给需要曝光的 dom 标记上 **appear** 属性即可、如下：

```ts
this.ob = new IntersectionObserver(
  (e: IntersectionObserverEntry[]) => {
    e.forEach((inter) => {
      if (inter.intersectionRatio > 0) {
        console.log(inter.target.className + "appear");
        inter.target.dispatchEvent(appearEvent);
        const target = inter.target as HTMLElement;
        const data = target.dataset;
        // 自动上报数据
        this.monitor.sendToAnalytics({
          ...data,
          pageId: data.pageId!,
          eventType: EventType.EXP,
        });
      } else {
        console.log(inter.target.className + "disappear");
        inter.target.dispatchEvent(disappearEvent);
        // 防止重复曝光
        this.ob.unobserve(inter.target);
      }
    });
  },
  {
    threshold: [0.2],
  }
);
const appear = document.querySelectorAll("[appear]");
for (let i = 0; i < appear.length; i++) {
  this.ob.observe(appear[i]);
}
```

前面说到 SDK 需要支持对 dom 进行自定义、比如我们曝光中特定 dom 需要进行操作、那么应该怎么操作呢？我们可以给它添加自定义监听事情、由他自己触发：如下：

```ts
const appearEvent = new CustomEvent("onAppear");
const disappearEvent = new CustomEvent("onDisappear");
// 接上面
inter.target.dispatchEvent(appearEvent);
inter.target.dispatchEvent(disappearEvent);

// 曝光触发自定义事件
document
  .getElementsByClassName("demo2")[0]
  .addEventListener("onAppear", function(e) {
    monitor.sendToAnalytics({
      pageId: "my",
      eventType: EventType.EXP,
      productId: 22,
      index: 10,
    });
  });
```

### 动态创建 DOM 的曝光

上面处理了常规的曝光、针对动态创建的 dom 我们的监听不可再次触发、有什么办法让再次触发呢？其实很简单、只需要让曝光的整个逻辑再运行一次便可以达到我们的需求。需要注意的是、我们要做一个防止重复监听的标记即可，如下：

```ts
 init() {
    const appear = document.querySelectorAll("[appear]");
    for (let i = 0; i < appear.length; i++) {
      if (!this.observerList.includes(appear[i])) {
        this.ob.observe(appear[i]);
        this.observerList.push(appear[i]);
      }
    }
  }
```

### More

后面还有针对请求并发、缓存、以及大数据数仓开发、后续。。。
