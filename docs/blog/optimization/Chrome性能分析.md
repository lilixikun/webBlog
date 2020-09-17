# Chrome插件性能分析

## Audtos

去 Chrome 搜索 Accessibility Developer Tools 添加至 Chrome 即可

打开面板发现新家一个 **Lifhhouse**的项,点击 **Generate report** 会给我们生成性能报告

## PageSpeed
去 Chrome 搜索 pagespeed 选择 PageSpeed Insights (with PNaCl) 添加至 Chrome 即可

打开控制面板会发现新加一个 **PageSpeed** 的项,点击 **START ANALYZING** 会列出我们可以优化的点


## performance.timing

我们可以使用浏览器的 API **performance.timing** 详细的记录 TCP连接,**DOM解析**,**白屏** 等时间

```html
<script>
  let t = performance.timing;
  console.log('DNS查询耗时 ：' + (t.domainLookupEnd - t.domainLookupStart).toFixed(0));
  console.log('TCP链接耗时 ：' + (t.connectEnd - t.connectStart).toFixed(0));
  console.log('request请求耗时 ：' + (t.responseEnd - t.responseStart).toFixed(0));
  console.log('解析dom树耗时 ：' + (t.domComplete - t.domInteractive).toFixed(0));
  console.log('白屏时间 ：' + (t.responseStart - t.navigationStart).toFixed(0));
  console.log('domready时间 ：' +(t.domContentLoadedEventEnd - t.navigationStart).toFixed(0));
  console.log('onload时间 ：' + (t.loadEventEnd - t.navigationStart).toFixed(0));

  if ((t = performance.memory)) {
    console.log('js内存使用占比 ：' +((t.usedJSHeapSize / t.totalJSHeapSize) * 100).toFixed(2) + '%');
  }
</script>
```

## Timeline
网页动画能够做到每秒 **60** 帧,就会跟显示器同步刷新,一秒之内进行 60 次重新渲染,每秒重新渲染的时间 不能超过 **16.66** 毫秒

- 蓝色:网络通信和 HTML 解析
- 黄色:JavaScript 执行时间
- 紫色:样式计算和布局,即重排
- 绿色:重绘

**window.requestAnimationFrame** 下一次渲染

**window.requestIdleCallback**  下几次渲染

## Profiles