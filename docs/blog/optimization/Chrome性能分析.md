# Chrome 性能分析

## LightHouse

**LightHouse** 是 Chrome 的一个插件,打开面板发现新家一个 **Lifhhouse**的项,点击 **Generate report** 会给我们生成性能报告,并提出一些能够优化的建议,如下:

![LightHouse](/optimization/LightHouse.png)

::: tip
如何不能科学上网,如何使用呢?
:::

这是我们可以使用 npm 安装依赖:

``` js
npm install -g lighthouse
```

然后进行测试:

```js
lighthouse http://www.quantdo.com.cn/
```

更详细的请参考 [lighthouse](https://github.com/GoogleChrome/lighthouse)

## PageSpeed

去 Chrome 搜索 pagespeed 选择 PageSpeed Insights (with PNaCl) 添加至 Chrome 即可

打开控制面板会发现新加一个 **PageSpeed** 的项,点击 **START ANALYZING** 会列出我们可以优化的点

![PageSpeed](/optimization/PageSpeed.png)

## WebPageTest
[webpagetest](https://www.webpagetest.org/) 是一款前端性能分析工具,可以在线测试,也可以独立搭建本地服务器. 多测试地点、全面性能报告,我愿称之为神器

![webpageTest](/optimization/webpageTest.png)


我们可以点开具体报告查看里面每个资源加载的具体时间、文件大小。我只能说真香!


## PerformanceObserver

可以利用 [PerformanceObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceObserver/PerformanceObserver) 来检测性能指标,如下:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>获取各种指标</title>
    <link rel="stylesheet"
        href="https://cdn.staticfile.org/twitter-bootstrap/5.0.0-alpha1/css/bootstrap-reboot.min.css" />
</head>

<body>
    <div id="app">
        <h1>aotu</h1>
    </div>

    <script>
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                console.log(entry.name);
                console.log(entry.startTime);
                console.log(entry.duration);
                console.log(entry.entryType);
            }
        });
        observer.observe({ entryTypes: ['paint', 'resource', 'mark'] });
    </script>
    <script>
        performance.mark('xikun')
    </script>
</body>

</html>
```

**entryTypes** 有如下几种:

| 属性        | 含义           
| ------------- |:-------------:|
| mark         | 通过 performance.mark()  | 
| measure      | 通过 performance.measure()      |  
| resource     | 资源时间      |   
| frame, navigation   | 文件的地址      |  
| paint | 获取绘制的时间,主要是 first-paint 和 first-contentful-paint |  
| longtask | 在浏览器执行超过 50ms 的任务      |  

使用框架 **web-vitals**

可以通过 npm 安装包使用 也可以直接使用 

```html
<script type="module">
    import { getCLS, getFID, getLCP } from 'https://unpkg.com/web-vitals@0.2.4/dist/web-vitals.es5.min.js?module';

    getCLS(console.log);
    getFID(console.log);
    getLCP(console.log);
</script>
```

更多详细移步:[web-vitals](https://www.npmjs.com/package/web-vitals)

## performance.timing

我们可以使用浏览器的 API **performance.timing** 详细的记录 TCP连接,**DOM解析**,**白屏** 等时间

```html
<script>
  let t = performance.timing;

  DNS 解析耗时: domainLookupEnd - domainLookupStart
  TCP 连接耗时: connectEnd - connectStart
  SSL 安全连接耗时: connectEnd - secureConnectionStart
  网络请求耗时 (TTFB): responseStart - requestStart
  数据传输耗时: responseEnd - responseStart
  DOM 解析耗时: domInteractive - responseEnd
  资源加载耗时: loadEventStart - domContentLoadedEventEnd
  First Byte时间: responseStart - domainLookupStart
  白屏时间: responseEnd - fetchStart
  首次可交互时间: domInteractive - fetchStart
  DOM Ready 时间: domContentLoadEventEnd - fetchStart
  页面完全加载时间: loadEventStart - fetchStart
  http 头部大小： transferSize - encodedBodySize
  重定向次数：performance.navigation.redirectCount
  重定向耗时: redirectEnd - redirectStart

  if ((t = performance.memory)) {
    console.log('js内存使用占比 ：' +((t.usedJSHeapSize / t.totalJSHeapSize) * 100).toFixed(2) + '%');
  }
</script>
```

![way.png](/optimization/way.png)

## Timeline
网页动画能够做到每秒 **60** 帧,就会跟显示器同步刷新,一秒之内进行 **60** 次重新渲染,每秒重新渲染的时间 不能超过 **16.66** 毫秒

- 蓝色:网络通信和 HTML 解析
- 黄色:JavaScript 执行时间
- 紫色:样式计算和布局,即重排
- 绿色:重绘

**window.requestAnimationFrame** 下一次渲染

**window.requestIdleCallback**  下几次渲染

## 思考
如何做一个小型的**监控系统**?

- 通过上述的方法拿到自己想要的指标
- 去服务器上请求 一个 1KB 大小的图片 并带上这些指标参数
- 使用 navigator.sendBeacon() 发送
- Node 读取服务器日志 过滤有效的接口
- 对接口参数整理并进行分析
- 开启定时任务每天凌晨12.00 开始读取数据并绘制出图表

::: tip
为什么使用 **navigator.sendBeacon()** 进行发送
:::

**navigator.sendBeacon()** 方法可用于通过HTTP将少量数据异步传输到Web服务器 而不占用进程

发送可以使用的优先级
1. navigator.sendBeacon()
2. ajax
3. fetch
